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
    const whoScoreAndReason = state.problemParts?.who
      ? `(score: ${state.problemParts.who.score}, reason for score: ${state.problemParts.who.missing})`
      : '';
    const whatScoreAndReason = state.problemParts?.what
      ? `(score: ${state.problemParts.what.score}, reason for score: ${state.problemParts.what.missing})`
      : '';
    const whereScoreAndReason = state.problemParts?.where
      ? `(score: ${state.problemParts.where.score}, reason for score: ${state.problemParts.where.missing})`
      : '';
    const whenScoreAndReason = state.problemParts?.when
      ? `(score: ${state.problemParts.when.score}, reason for score: ${state.problemParts.when.missing})`
      : '';
    const whyScoreAndReason = state.problemParts?.why
      ? `(score: ${state.problemParts.why.score}, reason for score: ${state.problemParts.why.missing})`
      : '';

    return new SystemMessage(`
      ${this.systemPrompt}

      Here are the previously generated states:
      Problem Parts and Scores:
        Who is affected by the problem?: ${state.problemParts?.who?.answer ?? '<empty>'} ${whoScoreAndReason})
        What are the pain points you’re trying to solve or you currently face?: ${state.problemParts?.what?.answer ?? '<empty>'} ${whatScoreAndReason})
        Where is the problem occurring?: ${state.problemParts?.where?.answer ?? '<empty>'} ${whereScoreAndReason})
        When does the problem occur?: ${state.problemParts?.when?.answer ?? '<empty>'} ${whenScoreAndReason})
        Why is the problem important or worth solving?: ${state.problemParts?.why?.answer ?? '<empty>'} ${whyScoreAndReason})
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.products ?? '<empty>'}`);
  }
}
