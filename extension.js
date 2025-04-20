const vscode = require('vscode');
const path = require('node:path');

function activate(context) {
	console.log('Congratulations, your extension "java-testingpair-opener" is now active!');
    const disposable = vscode.commands.registerCommand('java-testingpair-opener.openTestingPair', () => {
        
        const activeEditor = vscode.window.activeTextEditor;
        if(!isTarget(activeEditor)) {
            return;
        }
        
        const activeFilePath = activeEditor.document.uri.path;
        const testingPairsConfig = getTestingPairsConfig();
        
        // 現在のファイルがどのテスティングペアに該当するか特定
        const currentPair = identifyCurrentPair(activeFilePath, testingPairsConfig);
        
        // 次のテスティングペアを取得
        const nextPair = getNextTestingPair(currentPair, testingPairsConfig);
        
        // 次のテスティングペアのファイルパスを取得
        const pairFilePath = generatePairFilePath(activeFilePath, currentPair, nextPair);
        
        // 今のファイルの内容を取得
        vscode.workspace.openTextDocument(activeFilePath).then(currentDocument => {
            const currentDocumentContent = currentDocument.getText();
            const currentClassName = getClassName(activeFilePath);
            const defaultContentOfCurrentFile = makeDefaultContent(currentClassName, currentDocument.lineAt(0).text);

            // 次のファイルが存在するか確認
            vscode.workspace.openTextDocument(pairFilePath).then(nextDocument => {
                // 今のファイルがプロダクションコードでない場合（テストコードの場合）かつ、内容が変更されていない場合は削除
                deleteCurrentFileIfUnnecessary(currentPair, currentDocumentContent, defaultContentOfCurrentFile, activeFilePath, currentClassName);
                // 次のファイルを開く
                vscode.window.showTextDocument(nextDocument);
            }, () => {
                // ファイルが存在しない場合、新規作成
                const pairFileContent = Buffer.from(makeDefaultContent(getClassName(pairFilePath), activeEditor.document.lineAt(0).text)); 
                vscode.workspace.fs.writeFile(vscode.Uri.file(pairFilePath), pairFileContent).then(() => {
                    vscode.workspace.openTextDocument(pairFilePath).then(document => {
                        vscode.window.showTextDocument(document);
                        deleteCurrentFileIfUnnecessary(currentPair, currentDocumentContent, defaultContentOfCurrentFile, activeFilePath, currentClassName);
                    });
                }, () => {
                    vscode.window.showErrorMessage('Failed to create file: {$1}', pairFilePath);
                }); 
            });
        });
    });
    context.subscriptions.push(disposable);
}

function isTarget(activeEditor) {
    if (!activeEditor) {
        return false;
    }
    const activeFilePath = activeEditor.document.uri.path;
    return activeFilePath.endsWith('.java');
}

function getTestingPairsConfig() {
    return vscode.workspace.getConfiguration('java-testingpair-opener').get('testingPairs');
}

function identifyCurrentPair(filePath, testingPairs) {
    // ファイルパスから現在のテスティングペアを特定
    const fileName = path.basename(filePath, '.java');
    
    for (const pair of testingPairs) {
        if (filePath.includes(pair.pattern)) {
            // サフィックスも確認
            if (pair.suffix && pair.suffix.length > 0) {
                if (fileName.endsWith(pair.suffix)) {
                    return pair;
                }
            } else if (!hasAnySuffix(fileName, testingPairs)) { // サフィックスなしの場合は他のサフィックスがないことを確認
                return pair;
            }
        }
    }
    
    // デフォルトはプロダクションコード扱い
    return testingPairs[0];
}

function hasAnySuffix(fileName, testingPairs) {
    // fileName が任意のテスティングペアのサフィックスで終わるかどうかを確認
    return testingPairs.some(pair => pair.suffix && pair.suffix.length > 0 && fileName.endsWith(pair.suffix));
}

function getNextTestingPair(currentPair, testingPairs) {
    // 現在のポジションから次のテスティングペアを取得
    const sortedPairs = [...testingPairs].sort((a, b) => a.position - b.position);
    const currentIndex = sortedPairs.findIndex(pair => 
        pair.name === currentPair.name && 
        pair.pattern === currentPair.pattern && 
        pair.suffix === currentPair.suffix
    );
    
    if (currentIndex === -1 || currentIndex === sortedPairs.length - 1) {
        return sortedPairs[0]; // 最後の要素か見つからなかった場合は最初に戻る
    }
    
    return sortedPairs[currentIndex + 1];
}

function generatePairFilePath(currentFilePath, currentPair, nextPair) {
    // ベースとなるクラス名を抽出 (サフィックスを除去)
    let baseFileName = path.basename(currentFilePath, '.java');
    
    // 現在のサフィックスを削除
    if (currentPair.suffix && baseFileName.endsWith(currentPair.suffix)) {
        baseFileName = baseFileName.substring(0, baseFileName.length - currentPair.suffix.length);
    }
    
    // 次のサフィックスを追加
    const nextFileName = `${baseFileName}${nextPair.suffix}.java`;
    
    // パターンを置き換え
    const nextFilePath = currentFilePath.replace(currentPair.pattern, nextPair.pattern);
    
    // ファイル名を置き換え
    return nextFilePath.substring(0, nextFilePath.lastIndexOf('/') + 1) + nextFileName;
}

function getClassName(javaFilePath) {
    return path.basename(javaFilePath, '.java');
}

// ファイル内容がデフォルト内容と同じかどうかチェック
function isDefaultContent(content, defaultContent) {
    // 空白文字や改行の違いを無視するため、全ての空白文字を削除して比較
    const normalizedContent = content.replace(/\s+/g, '');
    const normalizedDefaultContent = defaultContent.replace(/\s+/g, '');
    return normalizedContent === normalizedDefaultContent;
}

// 次のペアがプロダクションコード（position=0）かどうかをチェック
function isProductionCode(pair) {
    // position=0 のペアをプロダクションコードと見なす
    return pair.position === 0;
}

function makeDefaultContent(className, activeDocumentFirstLine) {
    const packageLine = activeDocumentFirstLine.includes('package') ? activeDocumentFirstLine : '';
    return `${packageLine}\n\npublic class ${className} {\n\n}`;
}

function deleteCurrentFileIfUnnecessary(currentPair, currentDocumentContent, defaultContentOfCurrentFile, activeFilePath, currentClassName) {
    if (!isProductionCode(currentPair) && isDefaultContent(currentDocumentContent, defaultContentOfCurrentFile)) {
        vscode.workspace.fs.delete(vscode.Uri.file(activeFilePath)).then(() => {
            vscode.window.showInformationMessage(`Deleted unchanged test file: ${currentClassName}`);
        }, (error) => {
            // 何もしない
            // Errorであることを示した方が良いが、Delete,Create,Deleteを行った際に問題なく削除できているのに、Failしたかのようなメッセージが出てしまうため
        });
    } else {
        // 変更されている場合や、プロダクションコードの場合は何もしない
    }
}

// This method is called when your extension is deactivated
function deactivate() {
    // No cleanup needed
}

module.exports = {
	activate,
	deactivate
}