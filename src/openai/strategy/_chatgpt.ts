// Until some fixes have been done or official api for chatgpt released this will stay. Because unofficial module has some issues that prevents to use chatgpt with new version

// import { ChatGPTAPIBrowser } from 'chatgpt';
// import { Strategy } from './context';
// import { getMarkdowns } from '../../utils/regex';

// export default class ChatGPT implements Strategy {
//   #api: ChatGPTAPIBrowser;
//   constructor(email: string, password: string) {
//     this.#api = new ChatGPTAPIBrowser({ email, password });
//   }

//   async initSession() {
//     await this.#api.initSession();
//   }

//   async generate(input: string) {
//     const { response } = await this.#api.sendMessage(input);
//     const markdowns = getMarkdowns(response);

//     return markdowns?.join('') ?? null;
//   }

//   async refactor(input: string) {
//     const { response } = await this.#api.sendMessage(`
//       Can you please refactor this code:
//       "
//       ${input}
//       "
//     `);
//     const markdowns = getMarkdowns(response);

//     return markdowns?.join('') ?? null;
//   }
// }