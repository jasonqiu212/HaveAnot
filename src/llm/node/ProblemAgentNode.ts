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
  }

  override getSystemMessage(state: typeof StateSchema.State) {
    return new SystemMessage(`
      ${this.systemPrompt}

      Here are answers and their scores to the questions that make up a good problem statement:
      Who is affected by the problem?: ${state.problemParts?.who?.answer ?? '<empty>'} ${state.problemParts?.who ? '(score: ' + state.problemParts.who.score + ')' : ''})
      What are the pain points you’re trying to solve or you currently face?: ${state.problemParts?.what?.answer ?? '<empty>'} ${state.problemParts?.what ? '(score: ' + state.problemParts.what.score + ')' : ''})
      Where is the problem occurring?: ${state.problemParts?.where?.answer ?? '<empty>'} ${state.problemParts?.where ? '(score: ' + state.problemParts.where.score + ')' : ''})
      When does the problem occur?: ${state.problemParts?.when?.answer ?? '<empty>'} ${state.problemParts?.when ? '(score: ' + state.problemParts.when.score + ')' : ''})
      Why is the problem important or worth solving?: ${state.problemParts?.why?.answer ?? '<empty>'} ${state.problemParts?.why ? '(score: ' + state.problemParts.why.score + ')' : ''})
      
      Here is the previously generated problem statement:
      Problem: ${state.lastGeneratedProblem ?? '<empty>'}
      `);
  }

  // don't include the chat history with the user
  // so that problem statement generated is solely based on ProblemConstrucotrAgent's responses, and the previously response of this ProblemAgent
  override async invoke(state: typeof StateSchema.State) {
    const systemMessage = this.getSystemMessage(state);
    const response = await this.model.invoke([systemMessage]);

    return { [this.stateKey]: response };
  }
}
