export const GENERATOR_LINE_MATCH = '// @ai';

export const MESSAGES = Object.freeze({
  GENERATING: '[Generating, please wait...]',
  REFACTORING: '[Refactoring, please wait...]',
  NO_MARKDOWN: 'ChatGPT did not returned any piece of code.',
  NO_GENERATOR_LINE: `You did not write down any '${GENERATOR_LINE_MATCH}' comment lines`,
  NO_SELECTION: 'You did not select a code'
});

export const SECRETS_KEYS = {
  OPENAI_API_KEY: 'openai_api_key',
  CHATGPT_EMAIL: 'chatgpt_email',
  CHATGPT_PASSWORD: 'chatgpt_password'
};