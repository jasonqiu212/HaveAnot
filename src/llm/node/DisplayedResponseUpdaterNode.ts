import { GeneratedStateKey, StateSchema } from '../Langgraph';

export class DisplayedResponseUpdaterNode {
  prevAgentGenerationStateKey: GeneratedStateKey;
  updateDisplayedResponse: (stateValue: typeof StateSchema.State) => void;

  constructor(
    prevAgentGenerationStateKey: GeneratedStateKey,
    updateDisplayedResponse: (stateValue: typeof StateSchema.State) => void,
  ) {
    this.prevAgentGenerationStateKey = prevAgentGenerationStateKey;
    this.updateDisplayedResponse = updateDisplayedResponse;
  }

  invoke = (state: typeof StateSchema.State) => {
    console.log(state, this.prevAgentGenerationStateKey);
    this.updateDisplayedResponse(state);

    return {};
  };
}
