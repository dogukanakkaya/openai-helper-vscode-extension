import * as vscode from 'vscode';
import { ChatGPTAPI } from 'chatgpt';
import { getChatLines, getMarkdowns } from './utils/regex';

const MESSAGES = Object.freeze({
	GENERATING: '[Generating, please wait...]',
	REFACTORING: '[Refactoring, please wait...]',
	NO_MARKDOWN: 'ChatGPT did not returned any piece of code.',
	NO_CHAT_LINE: 'You did not write down any `@chat` comment lines',
	NO_SELECTION: 'You did not select a code'
});
const CHAT_LINE_REQUESTS: string[] = [];

let api: ChatGPTAPI | null = null;

export const getAPI = async () => {
	if (!api) {
		const sessionToken = await vscode.window.showInputBox({ prompt: "Enter session token", ignoreFocusOut: true, });
		const clearanceToken = await vscode.window.showInputBox({ prompt: "Enter clearance token", ignoreFocusOut: true, });

		if (!sessionToken || !clearanceToken) throw new Error('Invalid session/clearance token.');

		api = new ChatGPTAPI({ sessionToken, clearanceToken });
	}

	try {
		await api.ensureAuth();
	} catch (err) {
		api = null;
		throw err;
	}

	return api;
};

export async function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		generateCommand(),
		refactorCommand()
	);
}

export function deactivate() { }

export const generateCommand = () => {
	return vscode.commands.registerCommand('chatgpt-code.generate', async () => {
		const api = await getAPI();

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

			const chatText = chatLine.replace("// @chat", "");

			// prevent the next request to be sent if it's still waiting for response
			if (CHAT_LINE_REQUESTS.includes(chatText)) return;
			CHAT_LINE_REQUESTS.push(chatText);

			const response = await api.sendMessage(chatText);

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
	});
};

export const refactorCommand = () => {
	return vscode.commands.registerCommand('chatgpt-code.refactor', async () => {
		const api = await getAPI();

		const editor = vscode.window.activeTextEditor;
		if (!editor) return;

		const selection = vscode.window.activeTextEditor?.selection;
		const selectionText = editor.document.getText(selection);
		if (!selection) {
			vscode.window.showInformationMessage(MESSAGES.NO_SELECTION);
			return;
		};

		editor.edit(editBuilder => editBuilder.insert(selection.start, `// ${MESSAGES.REFACTORING}\n`));

		const response = await api.sendMessage(`
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
	});
};