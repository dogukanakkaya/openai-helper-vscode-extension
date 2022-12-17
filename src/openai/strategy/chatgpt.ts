import { ChatGPTAPI } from 'chatgpt';
import { Strategy } from './context';
import { getMarkdowns } from '../../utils/regex';

export default class ChatGPT implements Strategy {
  #api: ChatGPTAPI;
  constructor(sessionToken: string, clearanceToken: string) {
    this.#api = new ChatGPTAPI({ sessionToken, clearanceToken });
  }

  async initSession() {
    await this.#api.ensureAuth();
  }

  async generate(input: string) {
    const response = await this.#api.sendMessage(input);
    const markdowns = getMarkdowns(response);

    return markdowns?.join('') ?? null;
  }

  async refactor(input: string) {
    const response = await this.#api.sendMessage(`
      Can you please refactor this code:
      "
      ${input}
      "
    `);
    const markdowns = getMarkdowns(response);

    return markdowns?.join('') ?? null;
  }
}