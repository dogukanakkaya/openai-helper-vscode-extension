import * as vscode from 'vscode';
import { getChatLines, getMarkdowns } from './utils/regex';
import ChatGPT from './chatgpt';
import { MESSAGES } from './config';

const CHAT_LINE_REQUESTS: string[] = [];

let chatgpt: ChatGPT | null = null;

const askOrThrow = async (name: string) => {
  const response = await vscode.window.showInputBox({ prompt: `Enter ${name}`, ignoreFocusOut: true });
  if (!response) throw new Error(`Invalid ${name}`);

  return response;
};

export const getChatGPT = async () => {
  if (!chatgpt) {
    const sessionToken = await askOrThrow('session token');
    const clearanceToken = await askOrThrow('clearance token');
    chatgpt = new ChatGPT({ sessionToken, clearanceToken });

    try {
      await chatgpt.api.ensureAuth();
    } catch (err) {
      chatgpt = null;
      throw err;
    }
  }

  return chatgpt;
};

export const generateCommand = async () => {
  const chatgpt = await getChatGPT();

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const documentText = editor.document.getText();

  const chatLines = getChatLines(documentText);
  if (!chatLines) {
    vscode.window.showInformationMessage(MESSAGES.NO_CHAT_LINE);
    return;
  }

  for (const chatLine of chatLines) {
    const index = documentText.indexOf(chatLine);

    editor.edit(editBuilder => {
      const startLine = editor.document.lineAt(editor.document.positionAt(index).line);
      editBuilder.insert(startLine.range.end, ` ${MESSAGES.GENERATING}`);
    });

    const chatText = chatLine.replace('// @chat', '');

    // prevent the next request to be sent if it's still waiting for response
    if (CHAT_LINE_REQUESTS.includes(chatText)) return;
    CHAT_LINE_REQUESTS.push(chatText);

    const response = await chatgpt.api.sendMessage(chatText);

    const markdowns = getMarkdowns(response);
    if (!markdowns) {
      vscode.window.showErrorMessage(MESSAGES.NO_MARKDOWN);
      return;
    }

    editor.edit(editBuilder => {
      const startLine = editor.document.lineAt(editor.document.positionAt(index).line);
      editBuilder.replace(startLine.range, markdowns.join(''));
    });

    CHAT_LINE_REQUESTS.splice(CHAT_LINE_REQUESTS.indexOf(chatText), 1);
  }
};

export const refactorCommand = async () => {
  const chatgpt = await getChatGPT();

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const selection = editor.selection;
  if (!selection) {
    vscode.window.showInformationMessage(MESSAGES.NO_SELECTION);
    return;
  }

  editor.edit(editBuilder => editBuilder.insert(selection.start, `// ${MESSAGES.REFACTORING}\n`));

  const selectionText = editor.document.getText(selection);

  const response = await chatgpt.api.sendMessage(`
			Can you please refactor this code: 
			"
			${selectionText}
			"
		`);

  const markdowns = getMarkdowns(response);
  if (!markdowns) {
    vscode.window.showErrorMessage(MESSAGES.NO_MARKDOWN);
    return;
  }

  editor.edit(editBuilder => {
    const newEndLine = editor.document.lineAt(selection.end.line + 1);
    editBuilder.replace(new vscode.Range(selection.start, newEndLine.range.end), markdowns.join(''));
  });
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('chatgpt-code.generate', generateCommand),
    vscode.commands.registerCommand('chatgpt-code.refactor', refactorCommand)
  );
}