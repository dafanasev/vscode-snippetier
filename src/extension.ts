'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import Snippetier from './snippetier';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerTextEditorCommand(
    'extension.createSnippet',
    (textEditor, edit) => {
      const selection = textEditor.selection;
      const selectedText = textEditor.document.getText(textEditor.selection);

      vscode.window.showInputBox({ prompt: 'Snippet description' })
      .then(value => {
        if (isEmptyString(value)) {
          vscode.window.showInformationMessage('Please enter snippet description');
          return;
        }

        const description = value;
        return vscode.window.showInputBox({ prompt: 'Snippet prefix'})
        .then(value => {
          if (isEmptyString(value)) {
            vscode.window.showInformationMessage('Please enter snippet prefix');
            return;
          }

          const prefix = value;
          const snippetier = new Snippetier(context, textEditor.document.languageId, prefix, description, selectedText);
          try {
            snippetier.saveSnippet();
            vscode.window.showInformationMessage('The snippet has been created');
          } catch (error) {
            vscode.window.showErrorMessage('Error reading snippets file');
          }
        });
      });
    }
  );

  context.subscriptions.push(disposable);
}

function isEmptyString(str) {
  return !str.trim();
}

// this method is called when your extension is deactivated
export function deactivate() {}
