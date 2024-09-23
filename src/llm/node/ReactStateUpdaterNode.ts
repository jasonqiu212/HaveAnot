import {
  DisplayedResponses,
  GeneratedStateKey,
  StateSchema,
} from '../Langgraph';

export class ReactStateUpdaterNode {
  prevAgentGenerationStateKey: GeneratedStateKey;
  updateReactState: (
    stateValue: (typeof StateSchema.State)[GeneratedStateKey],
  ) => DisplayedResponses;
  isUpdatingChatHistory: boolean;

  constructor(
    prevAgentGenerationStateKey: GeneratedStateKey,
    updateReactState: (
      stateValue: (typeof StateSchema.State)[GeneratedStateKey],
    ) => DisplayedResponses,
    isUpdatingChatHistory: boolean,
  ) {
    this.prevAgentGenerationStateKey = prevAgentGenerationStateKey;
    this.updateReactState = updateReactState;
    this.isUpdatingChatHistory = isUpdatingChatHistory;
  }

  invoke = (
    state: typeof StateSchema.State,
  ): Partial<
    Pick<typeof StateSchema.State, 'currentReactState' | 'chatHistory'>
  > => {
    console.log(
      'state in reactstateupdaternode',
      state,
      this.prevAgentGenerationStateKey,
    );
    const previousAgentGeneration = state[this.prevAgentGenerationStateKey];
    const updatedReactStates = this.updateReactState(previousAgentGeneration);

    // if (this.isUpdatingChatHistory) {
    //   return {
    //     currentReactState: updatedReactStates,
    //     chatHistory: state.chatHistory,
    //   };
    // } else {
    return { currentReactState: updatedReactStates };
    // }
  };
}
