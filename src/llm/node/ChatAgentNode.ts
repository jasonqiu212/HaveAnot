import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { StateSchema } from '../Langgraph';
import { AgentNode } from './AgentNode';

export class ChatAgentNode extends AgentNode {
  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      AIMessageChunk,
      ChatOpenAICallOptions
    >,
    stateKey: string,
    systemPrompt: string,
  ) {
    super(model, stateKey, systemPrompt);
  }

  invoke = async (state: typeof StateSchema.State) => {
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

    return { [this.stateKey]: response, chatHistory: [response] };
  };
}
