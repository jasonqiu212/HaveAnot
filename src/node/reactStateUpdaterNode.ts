import { StateSchema } from '../Langgraph';

export class ReactStateUpdaterNode {
  // state[stateKey] gives the state from the previous node
  prevAgentGenerationStateKey:
    | 'lastGeneratedChat'
    | 'lastGeneratedProblem'
    | 'lastGeneratedFeatures'
    | 'lastGeneratedProducts';
  updateReactState: (
    stateKey: typeof this.prevAgentGenerationStateKey,
    stateValue: (typeof StateSchema.State)[typeof this.prevAgentGenerationStateKey],
  ) => {
    problem?: string;
    features?: string;
    products?: string;
  };
  isUpdatingChatHistory: boolean;

  constructor(
    prevAgentGenerationStateKey:
      | 'lastGeneratedChat'
      | 'lastGeneratedProblem'
      | 'lastGeneratedFeatures'
      | 'lastGeneratedProducts',
    updateReactState: (
      stateKey: typeof this.prevAgentGenerationStateKey,
      stateValue: (typeof StateSchema.State)[typeof this.prevAgentGenerationStateKey],
    ) => {
      problem?: string;
      features?: string;
      products?: string;
    },
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
    console.log('state in reactstateupdaternode', state);
    const previousAgentGeneration = state[this.prevAgentGenerationStateKey];
    const updatedReactStates = this.updateReactState(
      this.prevAgentGenerationStateKey,
      previousAgentGeneration,
    );

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
