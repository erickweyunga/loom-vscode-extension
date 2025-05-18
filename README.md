# Loom Language for Visual Studio Code

<!-- ![Loom Logo](images/loom-logo.png) -->

VSCode extension providing rich language support for the Loom programming language.

## Features

- **Syntax Highlighting** - Full TextMate grammar for Loom's unique syntax
- **Smart Editing** - Bracket matching, auto-indentation, and comment toggling
- **Code Snippets** - Quickly insert common patterns and structures
- **Commands** - Run Loom files directly from the editor

<!-- ![Syntax Highlighting Demo](images/syntax-demo.png) -->

## Installation

You can install this extension through the VSCode Marketplace:

1. Open VS Code
2. Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for "Loom Language"
4. Click Install

## Language Overview

Loom is a functional programming language with unique syntax designed for concise, expressive code. Key language features include:

### Thread Functions

Threads are Loom's primary function construct:

```loom
thread add(a, b) {
    return a + b;
}

// Expose a thread for external use
expose thread multiply(a, b) {
    return a * b;
}
```

### Variables with Weave

Declare variables using the `weave` keyword:

```loom
weave pi = 3.14159;
weave greeting = "Hello, Loom!";
```

### Control Flow with Knots and Patterns

Conditionals use the `knot` and `pattern` keywords:

```loom
knot (temperature > 30) {
    return "It's hot!";
} pattern {
    return "It's not hot.";
}
```

### Functional Pipelines

Use the pipe operator (`|>`) to create processing pipelines:

```loom
weave result = data 
    |> filter(isValid) 
    |> map(transform)
    |> reduce(sum, 0);
```

### Function Composition

Combine functions with the compose operator (`>>`):

```loom
weave validateAndProcess = validate >> process >> format;
```

### Module System

Import and export functionality with `include` and `expose`:

```loom
include "math";
include { filter, map } from "collections";

expose { calculateTotal, formatOutput };
```

## Snippets

| Prefix | Description |
|--------|-------------|
| `thread` | Create a new thread function |
| `pattern` | Create an exposed thread function |
| `weave` | Declare a variable |
| `knot` | Create an if-else statement |
| `loop` | Create a loop |
| `each` | Create a forEach loop |
| `include` | Include a module |
| `includefrom` | Include specific symbols from a module |
| `expose` | Expose symbols for export |
| `pipe` | Insert pipe operator usage |
| `compose` | Insert compose operator usage |

## Extension Settings

This extension contributes the following settings:

* `loom.enableDiagnostics`: Enable/disable diagnostics for Loom files
* `loom.formatOnSave`: Format Loom files on save
* `loom.tabSize`: Number of spaces for indentation in Loom files

## Standard Library

Loom comes with a standard library that includes:

### Math Functions

Basic operations:
```loom
abs(-5);      // 5
round(3.7);   // 4
floor(3.7);   // 3
ceil(3.7);    // 4
```

Random numbers:
```loom
random();     // 0 to 1
random(10);   // 0 to 10
random(5, 10); // 5 to 10
randomInt(1, 6); // 1 to 6 (inclusive)
```

Mathematical constants:
```loom
PI;           // 3.141592653589793
E;            // 2.718281828459045
TAU;          // 6.283185307179586 (2π)
PHI;          // 1.618033988749895 (Golden ratio)
```

## Commands

* `Loom: Run Current File` - Execute the current Loom file

## Known Issues

* No integrated debugger support yet
* Limited intellisense/autocomplete capabilities

## Contributing

Contributions are welcome! Check out the [repository](https://github.com/erickweyunga/loom-vscode-extension) and feel free to submit pull requests.

### Development Setup

1. Clone the repository
2. Run `npm install`
3. Open in VS Code
4. Press F5 to start debugging

## License

This extension is licensed under the [MIT License](LICENSE).