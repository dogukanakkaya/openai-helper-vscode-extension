import * as vscode from 'vscode';
import { ChatGPTAPI } from 'chatgpt';

const CHATGPT_REGEX = /^\/\/ @chat.*$/gm;
const MARKDOWN_REGEX = /```[\s\S]*?```/g;
const WAIT_TEXT = "[Generating, please wait...]";
const MESSAGE_REQUESTS: string[] = [];

let api: ChatGPTAPI | null = null;

export const createAPI = async () => {
	if (!api) {
		const sessionToken = await vscode.window.showInputBox({ prompt: "Enter your ChatGPT Session Token" });
		if (!sessionToken) {
			vscode.window.showErrorMessage('A session token is required.');
			throw new Error();
		}

		return new ChatGPTAPI({ sessionToken });
	}

	return api;
};

export function activate(context: vscode.ExtensionContext) {
	const disposable = vscode.commands.registerCommand('chatgpt-code.run', async () => {
		try {
			api = await createAPI();
			await api.ensureAuth();
		} catch (err) {
			api = null;
			vscode.window.showErrorMessage('Invalid session token.');
			return;
		}

		const editor = vscode.window.activeTextEditor;

		if (editor) {
			let document = editor.document;

			const documentText = document.getText();

			const matches = documentText.match(CHATGPT_REGEX);

			if (!matches) return;

			for (const match of matches) {
				const index = documentText.indexOf(match);
				const startPos = editor.document.positionAt(index);
				const endPos = editor.document.positionAt(index + match.length);
				const range = new vscode.Range(startPos, endPos);

				const matchWaitText = `${match} ${WAIT_TEXT}`;
				editor.edit(editBuilder => editBuilder.replace(range, matchWaitText));

				const text = match.replace("// @chat", "");

				// prevent the next request to be sent if it's still waiting for response
				if (MESSAGE_REQUESTS.includes(text)) return;

				MESSAGE_REQUESTS.push(text);
				const response = await api.sendMessage(text);

				const markdownMatches = response.match(MARKDOWN_REGEX);

				if (!markdownMatches) return;

				let output = '';

				for (const markdownMatch of markdownMatches) {
					output += markdownMatch.slice(3, -3);
				}

				editor.edit(editBuilder => {
					const endPos = editor.document.positionAt(index + matchWaitText.length);
					const range = new vscode.Range(startPos, endPos);
					editBuilder.replace(range, output);
				});

				MESSAGE_REQUESTS.splice(MESSAGE_REQUESTS.indexOf(text), 1);
			}
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }