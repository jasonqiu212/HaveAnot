import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk, SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { StateSchema } from '../Langgraph';

export class AgentNode {
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatOpenAICallOptions
  >;
  stateKey: string;
  systemPrompt: string;

  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      AIMessageChunk,
      ChatOpenAICallOptions
    >,
    stateKey: string,
    systemPrompt: string,
  ) {
    this.model = model;
    this.stateKey = stateKey;
    this.systemPrompt = systemPrompt;
  }

  invoke = async (state: typeof StateSchema.State) => {
    const systemMessage = new SystemMessage(
      `${this.systemPrompt}
      Here are the current states:
      Problem: ${state.currentReactState?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.currentReactState?.features ?? '<empty>'}
      Suggested Products: ${state.currentReactState?.products ?? '<empty>'}`,
    );

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

    return { [this.stateKey]: response };
  };
}
