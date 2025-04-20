# Java TestingPair Opener README

This is a VSCode-extension that opens JavaCode's TestingPair with a shortcutkey.

## Features

This extension adds "Open Testing Pair" to your keyboard shortcuts.  
The default shortcut key is Ctrl + 9 (Cmd + 9 on Mac).  
Executing "Open Testing Pair" opens Java TestingPair.  

When you press Ctrl + 9, the extension will cycle through your configured testing pairs.

### Default Testing Pairs:

1. Production code (src/main/java/com/example/Demo.java)
2. Unit test code (src/test/java/com/example/DemoTest.java)
3. Integration test code (src/int-test/java/com/example/DemoIntTest.java)

For example, if you open the class "com.example.demo.DemoRepository.java" at "src/main/java" in editor,   
pressing Ctrl + 9 will open "com.example.demo.DemoRepositoryTest.java" at "src/test/java".  
Pressing Ctrl + 9 again will open "com.example.demo.DemoRepositoryIntTest.java" at "src/int-test/java".
And pressing Ctrl + 9 once more will return to the original production code.

If the file does not exist, it will be created automatically.

## Configuration

You can customize the testing pairs in settings:

1. Open VSCode settings (File > Preferences > Settings)
2. Search for "Java TestingPair Opener"
3. Edit the "testingPairs" setting

Each testing pair has the following properties:
- `name`: A descriptive name for the pair
- `pattern`: The directory pattern (e.g., "src/main/java", "src/int-test/java")
- `suffix`: The suffix to add to the class name (e.g., "Test", "IntTest")
- `position`: The position in the cycle (0, 1, 2, ...)

Example configuration:

```json
"java-testingpair-opener.testingPairs": [
    {
        "name": "Production",
        "pattern": "src/main/java",
        "suffix": "",
        "position": 0
    },
    {
        "name": "Unit Test",
        "pattern": "src/test/java",
        "suffix": "Test",
        "position": 1
    },
    {
        "name": "Integration Test",
        "pattern": "src/int-test/java", 
        "suffix": "IntTest",
        "position": 2
    },
    {
        "name": "Other Test",
        "pattern": "src/other/java", 
        "suffix": "OtherTest",
        "position": 3
    }
]
```

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

### 1.1.0

- Added support for multiple testing pairs
- Added configuration option to customize testing pairs with custom directories
- Added auto-deletion feature: when switching testing pairs, test files that haven't been modified from their default content will be automatically deleted (production code files are always preserved)

---