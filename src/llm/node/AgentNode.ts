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
  shouldUpdateChatHistory: boolean;

  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      AIMessageChunk,
      ChatOpenAICallOptions
    >,
    stateKey: string,
    systemPrompt: string,
    shouldUpdateChatHistory: boolean,
  ) {
    this.model = model;
    this.stateKey = stateKey;
    this.systemPrompt = systemPrompt;
    this.shouldUpdateChatHistory = shouldUpdateChatHistory;
  }

  invoke = async (state: typeof StateSchema.State) => {
    const systemMessage = new SystemMessage(
      `${this.systemPrompt}

      Here are the current states:
      Problem: ${state.displayedResponses?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.products ?? '<empty>'}`,
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

    if (this.shouldUpdateChatHistory) {
      return { [this.stateKey]: response, chatHistory: [response] };
    }
    return { [this.stateKey]: response };
  };
}
