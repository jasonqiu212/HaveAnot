import { GeneratedStateKey, StateSchema } from '../Langgraph';

export class DisplayedResponseUpdaterNode<K extends GeneratedStateKey> {
  prevAgentGenerationStateKey: K;
  updateDisplayedResponse: (stateValue: (typeof StateSchema.State)[K]) => void;

  constructor(
    prevAgentGenerationStateKey: K,
    updateDisplayedResponse: (
      stateValue: (typeof StateSchema.State)[K],
    ) => void,
  ) {
    this.prevAgentGenerationStateKey = prevAgentGenerationStateKey;
    this.updateDisplayedResponse = updateDisplayedResponse;
  }

  invoke = (state: typeof StateSchema.State) => {
    console.log(state, this.prevAgentGenerationStateKey);
    const previousAgentGeneration = state[this.prevAgentGenerationStateKey];
    this.updateDisplayedResponse(previousAgentGeneration);

    return {};
  };
}
