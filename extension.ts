import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from 'child_process';

export function activate(context: vscode.ExtensionContext) {
  console.log('Loom language extension is now active!');

  // Register hover provider with enhanced descriptions
  const hoverProvider = vscode.languages.registerHoverProvider('loom', {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      if (!range) {
        return;
      }

      const word = document.getText(range);
      const hoverMap: Record<string, { description: string, example?: string }> = {
        'thread': {
          description: 'Defines a function in Loom language.',
          example: 'thread add(a, b) {\n  return a + b;\n}'
        },
        'weave': {
          description: 'Declares a mutable variable in Loom language.',
          example: 'weave count = 0;'
        },
        'knot': {
          description: 'Creates a conditional statement, similar to "if" in other languages.',
          example: 'knot (condition) {\n  // true branch\n} pattern {\n  // false branch\n}'
        },
        'pattern': {
          description: 'Used with "knot" for conditionals, or independently to define an exposed thread.',
          example: 'pattern reverse(list) {\n  // implementation\n}'
        },
        'loop': {
          description: 'Creates a loop that executes while a condition is true.',
          example: 'loop (i < 10) {\n  // loop body\n}'
        },
        'each': {
          description: 'Iterates over elements in a collection, similar to forEach in other languages.',
          example: 'each (item in collection) {\n  // process item\n}'
        },
        'include': {
          description: 'Imports functionality from other modules.',
          example: 'include "math";\ninclude { sum, average } from "statistics";'
        },
        'expose': {
          description: 'Makes functions or variables available for import by other modules.',
          example: 'expose { calculateTotal, formatOutput };'
        },
        'return': {
          description: 'Returns a value from a thread function.',
          example: 'return result;'
        },
        'and': {
          description: 'Logical AND operator.',
          example: 'knot (x > 0 and y > 0) {\n  // both conditions are true\n}'
        },
        'or': {
          description: 'Logical OR operator.',
          example: 'knot (x > 0 or y > 0) {\n  // at least one condition is true\n}'
        }
      };

      const info = hoverMap[word];
      if (info) {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown(`**${word}**: ${info.description}\n\n`);

        if (info.example) {
          markdown.appendCodeblock(info.example, 'loom');
        }

        return new vscode.Hover(markdown);
      }

      // Check for pipe and compose operators
      if (document.getText(new vscode.Range(position.translate(0, -1), position.translate(0, 1))) === '|>') {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown('**Pipe Operator**: Passes the result of the left expression as the first argument to the right function.\n\n');
        markdown.appendCodeblock('data |> process() |> format()', 'loom');
        return new vscode.Hover(markdown, new vscode.Range(position.translate(0, -1), position.translate(0, 1)));
      }

      if (document.getText(new vscode.Range(position.translate(0, -1), position.translate(0, 1))) === '>>') {
        const markdown = new vscode.MarkdownString();
        markdown.appendMarkdown('**Compose Operator**: Creates a new function by composing two functions together.\n\n');
        markdown.appendCodeblock('weave processAndFormat = process >> format;', 'loom');
        return new vscode.Hover(markdown, new vscode.Range(position.translate(0, -1), position.translate(0, 1)));
      }
    }
  });

  // Register completion provider for Loom
  const completionProvider = vscode.languages.registerCompletionItemProvider('loom', {
    provideCompletionItems(document, position, token, context) {
      const linePrefix = document.lineAt(position).text.substring(0, position.character);

      // Check if we're at the start of a line or after whitespace
      if (!linePrefix.trim() || /\s$/.test(linePrefix)) {
        const keywords = [
          'thread', 'weave', 'knot', 'pattern', 'loop', 'each', 'include', 'expose', 'return'
        ];

        return keywords.map(keyword => {
          const item = new vscode.CompletionItem(keyword, vscode.CompletionItemKind.Keyword);

          // Add snippets for keywords that typically have a block
          if (['thread', 'knot', 'pattern', 'loop', 'each'].includes(keyword)) {
            item.insertText = new vscode.SnippetString(`${keyword} $1 {\n\t$0\n}`);
          }

          return item;
        });
      }

      // Complete 'include' statement
      if (/include\s+$/.test(linePrefix)) {
        const item = new vscode.CompletionItem('from', vscode.CompletionItemKind.Keyword);
        item.insertText = new vscode.SnippetString('{ $1 } from "$2";');
        return [item];
      }

      return undefined;
    }
  });

  // Register document symbol provider for Loom
  const symbolProvider = vscode.languages.registerDocumentSymbolProvider('loom', {
    provideDocumentSymbols(document, token) {
      const symbols: vscode.DocumentSymbol[] = [];

      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text.trim();

        // Match thread declarations
        const threadMatch = text.match(/^(expose\s+)?thread\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (threadMatch) {
          const name = threadMatch[2];
          const exposed = !!threadMatch[1];
          const range = line.range;

          // Find the end of the thread function
          let endLine = i;
          let braceCount = 0;
          let foundOpeningBrace = false;

          for (let j = i; j < document.lineCount; j++) {
            const currentLine = document.lineAt(j).text;

            for (let k = 0; k < currentLine.length; k++) {
              if (currentLine[k] === '{') {
                braceCount++;
                foundOpeningBrace = true;
              } else if (currentLine[k] === '}') {
                braceCount--;
              }

              if (foundOpeningBrace && braceCount === 0) {
                endLine = j;
                break;
              }
            }

            if (foundOpeningBrace && braceCount === 0) {
              break;
            }
          }

          const fullRange = new vscode.Range(range.start, document.lineAt(endLine).range.end);

          const symbol = new vscode.DocumentSymbol(
            name,
            exposed ? 'Exposed Thread Function' : 'Thread Function',
            exposed ? vscode.SymbolKind.Function : vscode.SymbolKind.Method,
            fullRange,
            range
          );

          symbols.push(symbol);
        }

        // Match variable declarations
        const variableMatch = text.match(/^weave\s+([a-zA-Z_][a-zA-Z0-9_]*)/);
        if (variableMatch) {
          const name = variableMatch[1];

          const symbol = new vscode.DocumentSymbol(
            name,
            'Variable',
            vscode.SymbolKind.Variable,
            line.range,
            new vscode.Range(line.range.start, line.range.start.translate(0, name.length + 6))
          );

          symbols.push(symbol);
        }
      }

      return symbols;
    }
  });

  // Register command to run Loom files
  const runCommand = vscode.commands.registerCommand('loom.runCurrentFile', async () => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'loom') {
      try {
        // Save the file before running
        await editor.document.save();

        // This assumes you have a Loom interpreter installed
        // Replace 'loom' with the actual command to run Loom files
        const filePath = editor.document.uri.fsPath;

        const outputChannel = vscode.window.createOutputChannel('Loom');

        outputChannel.show(true);
        outputChannel.appendLine(`Running ${path.basename(filePath)}...`);

        // Execute the Loom interpreter
        // Note: Replace 'loom' with the actual command to run Loom files
        const loomProcess = cp.spawn('./loom', [filePath], { shell: true });

        loomProcess.stdout.on('data', (data) => {
          outputChannel.append(data.toString());
        });

        loomProcess.stderr.on('data', (data) => {
          outputChannel.append(data.toString());
        });

        loomProcess.on('close', (code) => {
          outputChannel.appendLine(`\nProcess exited with code ${code}`);
        });
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to run Loom file: ${error}`);
      }
    } else {
      vscode.window.showInformationMessage('No active Loom file to run');
    }
  });

  // Register diagnostics provider for linting Loom files
  const diagnosticsCollection = vscode.languages.createDiagnosticCollection('loom');

  const documentChangeListener = vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document.languageId === 'loom' && vscode.workspace.getConfiguration('loom').get('enableDiagnostics')) {
      updateDiagnostics(event.document, diagnosticsCollection);
    }
  });

  const documentOpenListener = vscode.workspace.onDidOpenTextDocument(document => {
    if (document.languageId === 'loom' && vscode.workspace.getConfiguration('loom').get('enableDiagnostics')) {
      updateDiagnostics(document, diagnosticsCollection);
    }
  });

  // Format document provider
  const formattingProvider = vscode.languages.registerDocumentFormattingEditProvider('loom', {
    provideDocumentFormattingEdits(document, options, token) {
      const result: vscode.TextEdit[] = [];
      const tabSize = vscode.workspace.getConfiguration('loom').get('tabSize', 2);

      // Simple formatting logic - adjust indentation based on braces
      let indentLevel = 0;

      for (let i = 0; i < document.lineCount; i++) {
        const line = document.lineAt(i);
        const text = line.text.trim();

        // Skip empty lines
        if (text === '') {
          continue;
        }

        // Decrease indent if line starts with closing brace
        if (text.startsWith('}')) {
          indentLevel = Math.max(0, indentLevel - 1);
        }

        // Calculate new indentation
        const newIndent = ' '.repeat(indentLevel * tabSize);
        const newText = newIndent + text;

        // Add edit if indentation changed
        if (newText !== line.text) {
          result.push(vscode.TextEdit.replace(
            new vscode.Range(line.range.start, line.range.end),
            newText
          ));
        }

        // Increase indent if line ends with opening brace
        if (text.endsWith('{')) {
          indentLevel++;
        }
      }

      return result;
    }
  });

  // Add all subscriptions to context
  context.subscriptions.push(
    hoverProvider,
    completionProvider,
    symbolProvider,
    runCommand,
    documentChangeListener,
    documentOpenListener,
    formattingProvider,
    diagnosticsCollection
  );
}

// Helper function to check for basic syntax issues
function updateDiagnostics(document: vscode.TextDocument, collection: vscode.DiagnosticCollection): void {
  const diagnostics: vscode.Diagnostic[] = [];

  for (let i = 0; i < document.lineCount; i++) {
    const line = document.lineAt(i);
    const text = line.text.trim();

    // Check for missing semicolons where expected
    if (text !== '' &&
      !text.endsWith('{') &&
      !text.endsWith('}') &&
      !text.endsWith(';') &&
      !text.startsWith('//')) {
      diagnostics.push({
        code: 'missing-semicolon',
        message: 'Statement should end with a semicolon',
        range: new vscode.Range(
          new vscode.Position(i, line.text.length),
          new vscode.Position(i, line.text.length)
        ),
        severity: vscode.DiagnosticSeverity.Warning,
        source: 'loom'
      });
    }

    // Check for variable declarations without initialization
    const weaveMatch = text.match(/^weave\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*;$/);
    if (weaveMatch) {
      diagnostics.push({
        code: 'uninitialized-variable',
        message: 'Variable declared but not initialized',
        range: line.range,
        severity: vscode.DiagnosticSeverity.Information,
        source: 'loom'
      });
    }
  }

  collection.set(document.uri, diagnostics);
}

export function deactivate() {
  // Cleanup resources when extension is deactivated
}