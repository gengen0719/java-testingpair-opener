# Java TestingPair Opener README

This is a VSCode-extension that opens JavaCode's TestingPair with a shortcutkey.

## Features

This extension adds "Open Testing Pair" to your keyboard shortcuts.  
The default shortcut key is Ctrl + 9.  
Executing "Open Testing Pair" opens Java TestingPair.  

For example, if you open the class "com.example.demo.DemoRepository.java" at "src/main/java" in editor,   
It will open "com.example.demo.DemoRepositoryTest.java" at "src/test/java".

```
"src/main/java" <=> "src/test/java"  
"com.example.demo.DemoRepository.java" <=> "com.example.demo.DemoRepositoryTest.java"  
```

Conversely, if you open the test class and run it, the implementation class will be opened.  
If the file does not exist, it will be created automatically.

## VSCode Marketplace

https://marketplace.visualstudio.com/items?itemName=gengen0719.java-testingpair-opener

## GitHub Repository

https://github.com/gengen0719/java-testingpair-opener

## Requirements

none.

## Release Notes

### 1.0.0

Initial release.

### 1.0.1

- Add information of github repository.

---