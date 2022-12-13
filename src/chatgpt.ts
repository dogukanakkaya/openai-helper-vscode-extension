import { ChatGPTAPI } from 'chatgpt';

export default class ChatGPT {
  #api: ChatGPTAPI;

  constructor({ sessionToken, clearanceToken }: ConstructorArgs) {
    this.#api = new ChatGPTAPI({ sessionToken, clearanceToken });
  }

  get api() {
    return this.#api;
  }
}

interface ConstructorArgs {
  sessionToken: string;
  clearanceToken: string;
}