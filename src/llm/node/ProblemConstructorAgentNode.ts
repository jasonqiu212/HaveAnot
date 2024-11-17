import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { SystemMessage } from '@langchain/core/messages';
import { Runnable, RunnableConfig } from '@langchain/core/runnables';

import { StateSchema } from '../Langgraph';
import { StructuredOutputAgentNode } from './StructuredOutputAgentNode';

export class ProblemConstructorAgentNode extends StructuredOutputAgentNode<'problemParts'> {
  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      (typeof StateSchema.State)['problemParts'],
      RunnableConfig
    >,
    stateKey: 'problemParts',
    systemPrompt: string,
  ) {
    super(model, stateKey, systemPrompt);
  }

  // exclude previously generated problem statement -> this is not necessary as it is only based on the previously generated problem parts
  override getSystemMessage(state: typeof StateSchema.State) {
    return new SystemMessage(`
      ${this.systemPrompt}

      Here are the previously generated states:
      Problem Parts and Scores:
        Who is affected by the problem?: ${state.problemParts?.who?.answer ?? '<empty>'} ${state.problemParts?.who ? '(score: ' + state.problemParts.who.score + ')' : ''})
        What are the pain points you’re trying to solve or you currently face?: ${state.problemParts?.what?.answer ?? '<empty>'} ${state.problemParts?.what ? '(score: ' + state.problemParts.what.score + ')' : ''})
        Where is the problem occurring?: ${state.problemParts?.where?.answer ?? '<empty>'} ${state.problemParts?.where ? '(score: ' + state.problemParts.where.score + ')' : ''})
        When does the problem occur?: ${state.problemParts?.when?.answer ?? '<empty>'} ${state.problemParts?.when ? '(score: ' + state.problemParts.when.score + ')' : ''})
        Why is the problem important or worth solving?: ${state.problemParts?.why?.answer ?? '<empty>'} ${state.problemParts?.why ? '(score: ' + state.problemParts.why.score + ')' : ''})
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.products ?? '<empty>'}`);
  }
}
