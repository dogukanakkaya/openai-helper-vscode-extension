import * as vscode from 'vscode';
import { getGeneratorLines } from './utils/regex';
import { GENERATOR_LINE_MATCH, MESSAGES, SECRETS_KEYS } from './config';
import Context from './openai/strategy/context';
import Codex from './openai/strategy/codex';
import ChatGPT from './openai/strategy/chatgpt';

const PROMPT_REQUESTS: string[] = [];

const ask = (name: string) => {
  return vscode.window.showInputBox({ prompt: `Enter ${name}`, ignoreFocusOut: true });
};

// const askOrThrow = async (name: string) => {
//   const response = await ask(name);
//   if (!response) throw new Error(`Invalid ${name}`);

//   return response;
// };

const getOpenAIStrategy = async (context: vscode.ExtensionContext): Promise<Context> => {
  const apiKey = await context.secrets.get(SECRETS_KEYS.OPENAI_API_KEY);
  if (apiKey) {
    return new Context(new Codex(apiKey));
  }

  const email = await context.secrets.get(SECRETS_KEYS.CHATGPT_EMAIL);
  const password = await context.secrets.get(SECRETS_KEYS.CHATGPT_PASSWORD);
  if (email && password) {
    return new Context(new ChatGPT(email, password));
  }

  throw new Error('You must set either an `api key` for OpenAI Codex or `email` and `password` for ChatGPT');
};

export const generateCommand = async (context: vscode.ExtensionContext) => {
  const strategy = await getOpenAIStrategy(context);

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const documentText = editor.document.getText();

  const generatorLines = getGeneratorLines(documentText);
  if (!generatorLines) {
    vscode.window.showInformationMessage(MESSAGES.NO_GENERATOR_LINE);
    return;
  }

  for (const generatorLine of generatorLines) {
    const index = documentText.indexOf(generatorLine);
    const startLine = editor.document.lineAt(editor.document.positionAt(index).line);

    editor.edit(editBuilder => editBuilder.insert(startLine.range.end, ` ${MESSAGES.GENERATING}`)); // instead of comment lines, add git blame like info lines

    const prompt = generatorLine.replace(GENERATOR_LINE_MATCH, '');

    // prevent the next request to be sent if it's still waiting for response
    if (PROMPT_REQUESTS.includes(prompt)) return;
    PROMPT_REQUESTS.push(prompt);

    const response = await strategy.generate(prompt);

    if (!response) return; // @todo handle

    await vscode.commands.executeCommand('editor.action.insertLineAfter', startLine.lineNumber);

    editor.edit(editBuilder => editBuilder.replace(editor.document.lineAt(startLine.lineNumber + 1).range, response[0]));

    PROMPT_REQUESTS.splice(PROMPT_REQUESTS.indexOf(prompt), 1);
  }
};

export const refactorCommand = async (context: vscode.ExtensionContext) => {
  const strategy = await getOpenAIStrategy(context);

  const editor = vscode.window.activeTextEditor;
  if (!editor) return;

  const selection = editor.selection;
  if (!selection) {
    vscode.window.showInformationMessage(MESSAGES.NO_SELECTION);
    return;
  }

  editor.edit(editBuilder => editBuilder.insert(selection.start, `// ${MESSAGES.REFACTORING}\n`));

  const selectionText = editor.document.getText(selection);

  const response = await strategy.refactor(selectionText);

  if (!response) return; // @todo handle

  await vscode.commands.executeCommand('editor.action.insertLineAfter', selection.end.line);

  editor.edit(editBuilder => {
    const endLine = editor.document.lineAt(selection.end.line + 2);
    editBuilder.replace(new vscode.Range(selection.start, endLine.range.end), response);
  });
};

export const setOpenAIApiKey = async (context: vscode.ExtensionContext) => {
  const apiKey = await ask('OpenAI api key');
  await (!apiKey ? context.secrets.delete(SECRETS_KEYS.OPENAI_API_KEY) : context.secrets.store(SECRETS_KEYS.OPENAI_API_KEY, apiKey));
};

export const setChatGPTCredentials = async (context: vscode.ExtensionContext) => {
  // session/clerance token will be changed by email/password later on
  const email = await ask('ChatGPT session token');
  await (!email ? context.secrets.delete(SECRETS_KEYS.CHATGPT_EMAIL) : context.secrets.store(SECRETS_KEYS.CHATGPT_EMAIL, email));

  const password = await ask('ChatGPT clerance token');
  await (!password ? context.secrets.delete(SECRETS_KEYS.CHATGPT_PASSWORD) : context.secrets.store(SECRETS_KEYS.CHATGPT_PASSWORD, password));
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('openai-helper.generate', () => generateCommand(context)),
    vscode.commands.registerCommand('openai-helper.refactor', () => refactorCommand(context)),
    vscode.commands.registerCommand('openai-helper.setOpenAIApiKey', () => setOpenAIApiKey(context)),
    vscode.commands.registerCommand('openai-helper.setChatGPTCredentials', () => setChatGPTCredentials(context))
  );
}