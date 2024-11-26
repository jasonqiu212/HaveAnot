import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk, SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { StateSchema } from '../Langgraph';
import { chatAgentExamples } from '../Prompts';
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

  override getSystemMessages(state: typeof StateSchema.State) {
    const whoScoreAndReason = state.lastGeneratedProblemParts?.who
      ? `(score: ${state.lastGeneratedProblemParts.who.score}, reason for score: ${state.lastGeneratedProblemParts.who.missing})`
      : '';
    const whatScoreAndReason = state.lastGeneratedProblemParts?.what
      ? `(score: ${state.lastGeneratedProblemParts.what.score}, reason for score: ${state.lastGeneratedProblemParts.what.missing})`
      : '';
    const whereScoreAndReason = state.lastGeneratedProblemParts?.where
      ? `(score: ${state.lastGeneratedProblemParts.where.score}, reason for score: ${state.lastGeneratedProblemParts.where.missing})`
      : '';
    const whenScoreAndReason = state.lastGeneratedProblemParts?.when
      ? `(score: ${state.lastGeneratedProblemParts.when.score}, reason for score: ${state.lastGeneratedProblemParts.when.missing})`
      : '';
    const whyScoreAndReason = state.lastGeneratedProblemParts?.why
      ? `(score: ${state.lastGeneratedProblemParts.why.score}, reason for score: ${state.lastGeneratedProblemParts.why.missing})`
      : '';

    return [
      new SystemMessage(chatAgentExamples),
      new SystemMessage(`
      ${this.systemPrompt}

      Here are the previously generated states:
      Problem Parts and Scores:
        Who is affected by the problem?: ${state.lastGeneratedProblemParts?.who?.answer ?? '<empty>'} ${whoScoreAndReason})
        What are the pain points you’re trying to solve or you currently face?: ${state.lastGeneratedProblemParts?.what?.answer ?? '<empty>'} ${whatScoreAndReason})
        Where is the problem occurring?: ${state.lastGeneratedProblemParts?.where?.answer ?? '<empty>'} ${whereScoreAndReason})
        When does the problem occur?: ${state.lastGeneratedProblemParts?.when?.answer ?? '<empty>'} ${whenScoreAndReason})
        Why is the problem important or worth solving?: ${state.lastGeneratedProblemParts?.why?.answer ?? '<empty>'} ${whyScoreAndReason})
      Problem: ${state.displayedResponses?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.productIds ?? '<empty>'}`),
    ];
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
