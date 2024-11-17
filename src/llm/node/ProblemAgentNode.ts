import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk, SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { StateSchema } from '../Langgraph';
import { AgentNode } from './AgentNode';

export class ProblemAgentNode extends AgentNode<'lastGeneratedProblem'> {
  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      AIMessageChunk,
      ChatOpenAICallOptions
    >,
    stateKey: 'lastGeneratedProblem',
    systemPrompt: string,
  ) {
    super(model, stateKey, systemPrompt);
    console.log(this.stateKey);
  }

  override getSystemMessage(state: typeof StateSchema.State) {
    return new SystemMessage(`
      ${this.systemPrompt}

      Here are the previously generated states:
      Problem: ${state.displayedResponses?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.products ?? '<empty>'}`);
  }
}
