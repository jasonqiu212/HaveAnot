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
  }

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
