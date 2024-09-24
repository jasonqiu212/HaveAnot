import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk, SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { StateSchema } from '../Langgraph';
import { AgentNode } from './AgentNode';

export class FeaturesAgentNode extends AgentNode {
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

  getSystemMessage = (state: typeof StateSchema.State) =>
    new SystemMessage(
      `${this.systemPrompt}

      Here is the latest problem statement:
      ${state.lastGeneratedProblem ?? '<empty>'}

      Here are the previously generated states:
      Problem: ${state.displayedResponses?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.products ?? '<empty>'}`,
    );
}
