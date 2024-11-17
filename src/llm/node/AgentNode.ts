import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk, SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { StateSchema } from '../Langgraph';

export abstract class AgentNode<K extends keyof typeof StateSchema.State> {
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatOpenAICallOptions
  >;
  stateKey: K;
  systemPrompt: string;

  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      AIMessageChunk,
      ChatOpenAICallOptions
    >,
    stateKey: K,
    systemPrompt: string,
  ) {
    this.model = model;
    this.stateKey = stateKey;
    this.systemPrompt = systemPrompt;
  }

  abstract getSystemMessage(state: typeof StateSchema.State): SystemMessage;

  // returns a Promise of a partial StateSchema.State object, containing the key of this.stateKey, and optionally containing the rest of the keys
  async invoke(
    state: typeof StateSchema.State,
  ): Promise<
    Pick<typeof StateSchema.State, K> &
      Partial<Omit<typeof StateSchema.State, K>>
  > {
    const systemMessage = this.getSystemMessage(state);

    const messages = [
      systemMessage,
      // for all tool messages, set their content field as '' if it is undefined
      ...(state.chatHistory ?? []).map((message) => {
        if (message._getType() === 'tool' && message.content === undefined) {
          message.content = '';
        }
        return message;
      }),
    ];

    const response = await this.model.invoke(messages);

    return { [this.stateKey]: response } as Pick<typeof StateSchema.State, K> &
      Partial<Omit<typeof StateSchema.State, K>>;
  }
}
