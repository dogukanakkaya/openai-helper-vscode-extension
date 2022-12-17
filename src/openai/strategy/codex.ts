import { Configuration, CreateImageRequest, OpenAIApi } from 'openai';
import { Strategy } from './context';
import { unescapeChars } from '../../utils/regex';

export default class Codex implements Strategy {
  #api: OpenAIApi;

  constructor(apiKey: string) {
    const configuration = new Configuration({ apiKey: apiKey });
    this.#api = new OpenAIApi(configuration);
  }

  async generate(input: string) {
    // const { data } = await this.#api.createCompletion({
    //   model: 'code-davinci-002',
    //   prompt: input,
    //   temperature: 0,
    //   max_tokens: 1024,
    //   top_p: 1.0,
    //   frequency_penalty: 0.5,
    //   presence_penalty: 0.0,
    //   stream: false
    // });

    const { data } = await this.#api.createEdit({
      model: 'code-davinci-edit-001',
      input: '',
      instruction: input,
      temperature: 0,
      top_p: 1.0
    });

    return data.choices[0].text ? unescapeChars(data.choices[0].text) : null;
  }

  async refactor(input: string) {
    const { data } = await this.#api.createEdit({
      model: 'code-davinci-edit-001',
      input,
      instruction: 'Refactor this function',
      temperature: 0,
      top_p: 1.0
    });

    return data.choices[0].text ? unescapeChars(data.choices[0].text) : null;
  }

  async createImage(params: CreateImageRequest) {
    const response = await this.#api.createImage(params);
    return response.data.data[0].url;
  }
}