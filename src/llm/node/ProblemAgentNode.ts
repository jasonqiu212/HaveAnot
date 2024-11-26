import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk, SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { StateSchema } from '../Langgraph';
import { problemAgentExamples } from '../Prompts';
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
      new SystemMessage(problemAgentExamples),
      new SystemMessage(`
      ${this.systemPrompt}

      Here are the previously generated states:
      Problem Parts and Scores:
        Who is affected by the problem?: ${state.lastGeneratedProblemParts?.who?.answer ?? '<empty>'} ${whoScoreAndReason})
        What are the pain points you’re trying to solve or you currently face?: ${state.lastGeneratedProblemParts?.what?.answer ?? '<empty>'} ${whatScoreAndReason})
        Where is the problem occurring?: ${state.lastGeneratedProblemParts?.where?.answer ?? '<empty>'} ${whereScoreAndReason})
        When does the problem occur?: ${state.lastGeneratedProblemParts?.when?.answer ?? '<empty>'} ${whenScoreAndReason})
        Why is the problem important or worth solving?: ${state.lastGeneratedProblemParts?.why?.answer ?? '<empty>'} ${whyScoreAndReason})
      
      Here is the previously generated problem statement:
      Problem: ${state.lastGeneratedProblem?.content ?? '<empty>'}
      `),
    ];
  }

  // don't include the chat history with the user
  // so that problem statement generated is solely based on ProblemConstrucotrAgent's responses, and the previous response of this ProblemAgent
  override async invoke(state: typeof StateSchema.State) {
    const systemMessages = this.getSystemMessages(state);
    const response = await this.model.invoke(systemMessages);

    return { [this.stateKey]: response };
  }
}
