import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Loom language extension is now active!');

  // Register a simple hover provider for keywords
  const hoverProvider = vscode.languages.registerHoverProvider('loom', {
    provideHover(document, position, token) {
      const range = document.getWordRangeAtPosition(position);
      const word = document.getText(range);

      if (word === 'thread') {
        return new vscode.Hover('Defines a function in Loom language. Similar to functions in other languages.');
      }
      if (word === 'weave') {
        return new vscode.Hover('Declares a mutable variable in Loom language.');
      }
      if (word === 'knot') {
        return new vscode.Hover('Declares a constant (immutable value) in Loom language.');
      }
      if (word === 'pattern') {
        return new vscode.Hover('Defines a reusable pattern in Loom language.');
      }
      if (word === 'each') {
        return new vscode.Hover('Iterates over elements in a collection.');
      }
      if (word === 'include') {
        return new vscode.Hover('Imports functionality from other modules.');
      }
      if (word === 'expose') {
        return new vscode.Hover('Makes functions or variables available for import by other modules.');
      }
    }
  });

  context.subscriptions.push(hoverProvider);
}

export function deactivate() {}