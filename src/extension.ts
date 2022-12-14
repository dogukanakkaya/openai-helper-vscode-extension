import * as vscode from 'vscode';
import { getGeneratorLines } from './utils/regex';
import { GENERATOR_LINE_MATCH, MESSAGES, SECRETS_KEYS } from './config';
import Context from './openai/strategy/context';
import Codex from './openai/strategy/codex';
import ChatGPT from './openai/strategy/chatgpt';
import { CreateImageRequestSizeEnum } from 'openai';
import * as path from 'node:path';
import * as https from 'node:https';
import { Transform } from 'node:stream';

const ask = (name: string) => {
  return vscode.window.showInputBox({ prompt: `Enter ${name}`, ignoreFocusOut: true });
};

const askOrThrow = async (name: string): Promise<string> => {
  const response = await ask(name);
  if (!response) throw new Error(`${name} is mandatory`);

  return response;
};

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

    const input = generatorLine.replace(GENERATOR_LINE_MATCH, '');

    const response = await strategy.generate(input);

    if (!response) return; // @todo handle

    await vscode.commands.executeCommand('editor.action.insertLineAfter', startLine.lineNumber);

    editor.edit(editBuilder => editBuilder.replace(editor.document.lineAt(startLine.lineNumber).range, response));
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

export const imageGeneration = async (context: vscode.ExtensionContext) => {
  const apiKey = await context.secrets.get(SECRETS_KEYS.OPENAI_API_KEY);
  if (!apiKey) throw new Error('You must set an `api key` for image generation');

  const codex = new Codex(apiKey);

  const prompt = await askOrThrow('Describe the image');
  const n = parseInt(await ask('Number of image to generate (default 1)') || '1');

  const items: vscode.QuickPickItem[] = [
    { label: '512x512', description: 'default' },
    { label: '256x256' },
    { label: '1024x1024' }
  ];
  const { label } = (await vscode.window.showQuickPick(items, { ignoreFocusOut: true }) ?? { label: '512x512' });
  const name = await ask('Image name you want to save as (optional) (without extension)') || prompt.replace(/ /g, '-').replace(/[^\w-]+/g, '');

  vscode.window.withProgress({
    location: vscode.ProgressLocation.Window,
    cancellable: false,
    title: 'Generating image'
  }, async progress => {
    progress.report({ increment: 0 });

    const image = await codex.createImage({ prompt, n, size: label as CreateImageRequestSizeEnum });
    if (!image) throw new Error('Error while generating image');

    progress.report({ increment: 50 });

    const folder = vscode.workspace.workspaceFolders;
    if (!folder) return;

    const folderUri = folder[0].uri;
    const fileUri = folderUri.with({ path: path.join(folderUri.path, `${name}.png`) });

    https.request(image, response => {
      const data = new Transform();

      response.on('data', chunk => data.push(chunk));
      response.on('end', async () => {
        await vscode.workspace.fs.writeFile(fileUri, data.read());
        await vscode.window.showInformationMessage(`${name}.png generated`);
        progress.report({ increment: 100 });
      });
    }).end();
  });
};

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('openai-helper.generate', () => generateCommand(context)),
    vscode.commands.registerCommand('openai-helper.refactor', () => refactorCommand(context)),
    vscode.commands.registerCommand('openai-helper.setOpenAIApiKey', () => setOpenAIApiKey(context)),
    vscode.commands.registerCommand('openai-helper.setChatGPTCredentials', () => setChatGPTCredentials(context)),
    vscode.commands.registerCommand('openai-helper.imageGeneration', () => imageGeneration(context))
  );
}