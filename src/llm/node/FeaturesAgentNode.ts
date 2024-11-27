import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { StateSchema } from '../Langgraph';
import { getFeaturesFromOutputSchema } from '../Utils';
import { StructuredOutputAgentNode } from './StructuredOutputAgentNode';

export class FeaturesAgentNode extends StructuredOutputAgentNode<'lastGeneratedFeatures'> {
  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      (typeof StateSchema.State)['lastGeneratedFeatures'],
      ChatOpenAICallOptions
    >,
    stateKey: 'lastGeneratedFeatures',
    systemPrompt: string,
  ) {
    super(model, stateKey, systemPrompt);
  }

  override getSystemMessages(state: typeof StateSchema.State) {
    return [
      new SystemMessage(
        `${this.systemPrompt}

      Here is the latest problem statement:
      ${state.lastGeneratedProblem?.content ?? '<empty>'}

      Here are the latest solution features:
      ${getFeaturesFromOutputSchema(state.lastGeneratedFeatures)}

      Here are the previously generated states:
      Problem: ${state.displayedResponses?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.productIds ?? '<empty>'}`,
      ),
    ];
  }
}
