import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk, SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { StateSchema } from '../Langgraph';
import { AgentNode } from './AgentNode';

export class ChatAgentNode extends AgentNode<'lastGeneratedChat'> {
  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      AIMessageChunk,
      ChatOpenAICallOptions
    >,
    stateKey: 'lastGeneratedChat',
    systemPrompt: string,
  ) {
    super(model, stateKey, systemPrompt);
    console;
  }

  override getSystemMessage(state: typeof StateSchema.State) {
    return new SystemMessage(`
      ${this.systemPrompt}

      Here are the previously generated states:
      Problem: ${state.displayedResponses?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.products ?? '<empty>'}`);
  }

  override async invoke(state: typeof StateSchema.State) {
    const superResponse = await super.invoke(state);

    superResponse.chatHistory =
      superResponse[this.stateKey] === undefined
        ? []
        : [superResponse[this.stateKey]!];
    return superResponse;
  }
}
