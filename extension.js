const vscode = require('vscode');

function activate(context) {
	console.log('Congratulations, your extension "java-testingpair-opener" is now active!');
    const disposable = vscode.commands.registerCommand('java-testingpair-opener.openTestingPair', () => {
        
        const activeEditor = vscode.window.activeTextEditor;
        if(!isTarget(activeEditor)) {
            return;
        }
        
        const activeFilePath = activeEditor.document.uri.path;
        const pairFilePath = getPairFilePath(activeFilePath);
        vscode.workspace.openTextDocument(pairFilePath).then(document => {
            vscode.window.showTextDocument(document);
        }, () => {
            const packageLine = activeEditor.document.lineAt(0).text.includes('package') ? activeEditor.document.lineAt(0).text : '';
            const pairFileContent = Buffer.from(packageLine + '\n\npublic class '+ getClassName(pairFilePath) + ' {\n\n}'); 
            vscode.workspace.fs.writeFile(vscode.Uri.file(pairFilePath) , pairFileContent).then(() => {
                vscode.workspace.openTextDocument(pairFilePath).then(document => {
                    vscode.window.showTextDocument(document);
                });
            }, () => {
                vscode.window.showErrorMessage('Failed to create file : ' + pairFilePath);
            }); 
        });
        function isTarget(activeEditor){
            if (!activeEditor) {
                return false;
            }
            const activeFilePath = activeEditor.document.uri.path;
            if(!activeFilePath.endsWith('.java')) {
                return false;
            }
            return true;
        }
        function getPairFilePath(activeFilePath){
            if(activeFilePath.endsWith('Test.java')) {
                return activeFilePath.replace('src/test/java', 'src/main/java').replace('Test.java', '.java');
            } else {
                return activeFilePath.replace('src/main/java', 'src/test/java').replace('.java', 'Test.java');
            }
        }
        function getClassName(javaFilePath){
            return javaFilePath.split('/').pop().replace('.java', '');
        }
    });
    context.subscriptions.push(disposable);
}


// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
