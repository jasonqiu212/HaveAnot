import { AIMessage, HumanMessage } from '@langchain/core/messages';
import {
  Annotation,
  CompiledStateGraph,
  MemorySaver,
  StateDefinition,
  StateGraph,
} from '@langchain/langgraph/web';

import { getOpenAIModel } from './Utils';
import { AgentNode } from './node/AgentNode';
import { ReactStateUpdaterNode } from './node/ReactStateUpdaterNode';

export type GeneratedStateKey =
  | 'lastGeneratedChat'
  | 'lastGeneratedProblem'
  | 'lastGeneratedFeatures'
  | 'lastGeneratedProducts';

// Does not include chat, since state.messages already includes chat history and
// users cannot modify displayed chat
export interface DisplayedResponses {
  problem?: string;
  features?: string;
  products?: string;
}

export const StateSchema = Annotation.Root({
  // List of user inputs
  chatHistory: Annotation<AIMessage[] | undefined>({
    // By defining the reducer, a node only needs to return new messages to update the state,
    // instead of returning previous and new messages
    reducer: (
      left: AIMessage[] | undefined,
      right: AIMessage[] | undefined,
    ) => [...(left ?? []), ...(right ?? [])],
  }),

  currentReactState: Annotation<DisplayedResponses | undefined>,

  // Only used for ReactStateUpdatedNodes
  lastGeneratedChat: Annotation<AIMessage | undefined>,
  lastGeneratedProblem: Annotation<AIMessage | undefined>,
  lastGeneratedFeatures: Annotation<AIMessage | undefined>,
  lastGeneratedProducts: Annotation<AIMessage | undefined>,
});

export class HaveAnotLanggraph {
  chatAgentNode = new AgentNode(
    getOpenAIModel(),
    'lastGeneratedChat',
    `Role: 
    You are a chat agent that matches the length of the response to the user's message. 
    
    Task: 
    Chat with the user to understand their problem statement, and prompt them to provide more details if necessary to formulate a good problem statement.
    If you are asked to update the problem, features or products, respond that this has been done, with the assumption that will be done automatically for you.
    Take both the chat history and the current state of the problem, features and products into account when responding.`,
  );
  //   Task: Determine if the user's problem statement is detailed enough. If it is, call the tool to summarise what the requirements of a solution for the overall problem statement.
  // Do not give a suggestion of the updated problem statement, unless the user is unable to improve on the problem statement after 3 prompts.
  // Output: You must always return an textual explanation in your response, and the problem statement based on the current context you have, without any improvements.,

  // Examples:
  // User: 60% of Singaporeans lack the knowledge of what can be recycled when disposing their trash. This results in them choosing not to recycle because of the additional effort required for research, resulting in low recycling rates.
  // Expert: Good! This is a detailed and specific problem statement that mentions a specific statistic of 60% and a specific nationality is part of the problem. It is clear what the problem is, who it affects, and why it is a problem.
  chatReactStateUpdaterNode: ReactStateUpdaterNode;

  problemAgentNode = new AgentNode(
    getOpenAIModel(),
    'lastGeneratedProblem',
    `Role:
    You are an expert at crafting problem statements.

    Task: 
    Output a problem statement based on the chat history and the current state of the problem, features and products.
    Output nothing if you do not think the problem statement needs to be updated, or if there isn't enough information to generate a problem statement.

    Example:
    60% of Singaporeans lack the knowledge of what can be recycled when disposing their trash. This results in them choosing not to recycle because of the additional effort required for research, resulting in low recycling rates.`,
  );
  problemReactStateUpdaterNode: ReactStateUpdaterNode;

  featuresAgentNode = new AgentNode(
    getOpenAIModel(),
    'lastGeneratedFeatures',
    `Just output: I am a features agent.`,
  );
  featuresReactStateUpdaterNode: ReactStateUpdaterNode;

  productsAgentNode = new AgentNode(
    getOpenAIModel(),
    'lastGeneratedProducts',
    `Just output: I am a features agent.`,
  );
  productsReactStateUpdaterNode: ReactStateUpdaterNode;

  getReactStates: () => DisplayedResponses;
  setReactStateChat: (chat: string) => void;
  setReactStateProblem?: (problem: string) => void;
  setReactStateFeatures?: (features: string) => void;
  setReactStateProducts?: (products: string) => void;

  app: CompiledStateGraph<any, any, any, StateDefinition>;

  constructor(
    getReactState: () => DisplayedResponses,
    setReactStateChat: (chat: string) => void,
    setReactStateProblem: (problem: string) => void,
    setReactStateFeatures: (features: string) => void,
    setReactStateProducts: (products: string) => void,
  ) {
    this.getReactStates = getReactState;
    this.setReactStateChat = setReactStateChat;
    this.setReactStateProblem = setReactStateProblem;
    this.setReactStateFeatures = setReactStateFeatures;
    this.setReactStateProducts = setReactStateProducts;

    this.chatReactStateUpdaterNode = new ReactStateUpdaterNode(
      'lastGeneratedChat',
      (stateValue) => {
        const messageStr = stateValue?.content.toString();
        if (messageStr) {
          setReactStateChat(messageStr);
        }
        return this.getReactStates();
      },
      true,
    );
    this.problemReactStateUpdaterNode = new ReactStateUpdaterNode(
      'lastGeneratedProblem',
      (stateValue) => {
        const messageStr = stateValue?.content.toString();
        if (messageStr) {
          setReactStateProblem(messageStr);
        }
        return this.getReactStates();
      },
      false,
    );
    this.featuresReactStateUpdaterNode = new ReactStateUpdaterNode(
      'lastGeneratedFeatures',
      (stateValue) => {
        const messageStr = stateValue?.content.toString();
        if (messageStr) {
          setReactStateFeatures(messageStr);
        }
        return this.getReactStates();
      },
      false,
    );
    this.productsReactStateUpdaterNode = new ReactStateUpdaterNode(
      'lastGeneratedProducts',
      (stateValue) => {
        const messageStr = stateValue?.content.toString();
        if (messageStr) {
          setReactStateProducts(messageStr);
        }
        return this.getReactStates();
      },
      false,
    );

    const langgraph = new StateGraph(StateSchema)
      .addNode('chatAgent', this.chatAgentNode.invoke)
      .addNode('chatReactStateUpdater', this.chatReactStateUpdaterNode.invoke)
      .addNode('problemAgent', this.problemAgentNode.invoke)
      .addNode(
        'problemReactStateUpdater',
        this.problemReactStateUpdaterNode.invoke,
      )
      .addNode('featuresAgent', this.featuresAgentNode.invoke)
      .addNode(
        'featuresReactStateUpdater',
        this.featuresReactStateUpdaterNode.invoke,
      )
      .addNode('productsAgent', this.productsAgentNode.invoke)
      .addNode(
        'productsReactStateUpdater',
        this.productsReactStateUpdaterNode.invoke,
      )

      .addEdge('__start__', 'chatAgent')
      .addEdge('chatAgent', 'chatReactStateUpdater')
      .addEdge('chatReactStateUpdater', 'problemAgent')
      .addEdge('problemAgent', 'problemReactStateUpdater')
      .addEdge('problemReactStateUpdater', 'featuresAgent')
      .addEdge('featuresAgent', 'featuresReactStateUpdater')
      .addEdge('featuresReactStateUpdater', 'productsAgent')
      .addEdge('productsAgent', 'productsReactStateUpdater')
      .addEdge('productsReactStateUpdater', 'chatAgent');

    this.app = langgraph.compile({
      checkpointer: new MemorySaver(),
      interruptAfter: ['productsReactStateUpdater'],
    });
  }

  async invoke(
    message: string,
    config: { configurable: { thread_id: number } },
  ) {
    return this.app.invoke(
      {
        chatHistory: [new HumanMessage(message)],
      },
      config,
    );
  }
}

// const checkIfUpdatingProblem = ({
//   chatHistory: messages,
// }: typeof StateSchema.State) => {
//   const lastMessage = messages[messages.length - 1];

//   if (lastMessage.tool_calls?.length ?? 0 > 0) {
//     switch (lastMessage.tool_calls?.[0].name ?? '') {
//       case 'showSolutionRequirementsTool': {
//         console.log('showing solution requirement');
//         return 'showSolutionRequirements';
//       }
//       default: {
//         console.log("tools don't match the given tools, showing answer");
//         return 'showAnswer';
//       }
//     }
//   } else {
//     console.log('not using any tools, showing answer');
//     return 'showAnswer';
//   }
// };

// // TODO: on error, instead of console.log('Error with bot'), show a modal to the user
// export class ProblemStatementAgent {
//   // start with an agent node and an answer node connected by conditional edge; interruptBefore at the agent node to wait for user input
//   // conditional edge prevents going to answer node if other conditional edges from agent are true
//   // call tool node with conditional edge, user can set a boolean in a state after clicking how
//   // tool node invokes model, and calls another tool node to show examples to user + add examples as an AI message to the state + a message that the AI has generated examples, which then leads to the answer node
//   // keeps the examples in the message history for future calls
//   // clicking on an example highlights it, and sets it in the state after submitting message
//   // if this is set, the conditional edge leads to a tool node to check if this message answers the example
//   // if it does, call another tool to remove the example, which then leads to the answer node
//   // if it doesn't, go straight to the answer node with explanation why

//   // need to ensure agent proactively tries to help write an example problem statement if taking too many prompts

//   showSolutionRequirementsTool: DynamicStructuredTool<any>;
//   tools: DynamicStructuredTool<any>[];
//   showAnswer: (state: typeof StateSchema.State) => Promise<any>;
//   model: Runnable<
//     BaseLanguageModelInput,
//     AIMessageChunk,
//     ChatOpenAICallOptions
//   >;
//   app: CompiledStateGraph<any, any, any, any>;
//   graphConfig = {
//     configurable: { thread_id: '1' },
//     streamMode: 'updates' as const,
//   };
//   memory: MemorySaver;

//   constructor(
//     showSolutionRequirementsCallback: (
//       explanation: string,
//       solution: string[],
//     ) => void,
//     showAnswerCallback: (message: Message) => void,
//   ) {
//     this.showSolutionRequirementsTool = tool(
//       ({ explanation, requirements }) =>
//         showSolutionRequirementsCallback(explanation, requirements),
//       {
//         name: 'showSolutionRequirementsTool',
//         description: 'Show the requirements of the solution',
//         schema: z.object({
//           explanation: z
//             .string()
//             .describe(
//               'An explanation of the solution required and its requirements',
//             ),
//           requirements: z
//             .array(z.string())
//             .describe('A list of around 5-7 requirements for the solution'),
//         }),
//       },
//     );
//     this.tools = [this.showSolutionRequirementsTool];

//     this.showAnswer = async (state: typeof StateSchema.State) => {
//       console.log('in show answer');
//       console.log(state);
//       if (state.chatHistory.length > 0) {
//         let i = state.chatHistory.length - 1;
//         while (
//           i >= 0 &&
//           !['ai', 'human'].includes(state.chatHistory[i]._getType())
//         ) {
//           console.log(`message ${i}, ${state.chatHistory[i]._getType()}`);
//           i--;
//         }
//         const lastHumanOrAIMessage = state.chatHistory[i];
//         console.log(lastHumanOrAIMessage, lastHumanOrAIMessage._getType());
//         switch (lastHumanOrAIMessage._getType()) {
//           case 'ai': {
//             showAnswerCallback({
//               role: 'AI',
//               text: lastHumanOrAIMessage.content.toString(),
//             });
//             break;
//           }
//           case 'human': {
//             showAnswerCallback({
//               role: 'Human',
//               text: lastHumanOrAIMessage.content.toString(),
//             });
//             break;
//           }
//         }
//       }
//     };

//     this.model = new ChatOpenAI({
//       openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
//     }).bindTools(this.tools);

//     const langgraph = new StateGraph(StateSchema)
//       .addNode('agent', (state) => getModelResponse(this.model, state))
//       .addNode(
//         'showSolutionRequirements',
//         new ToolNode([this.showSolutionRequirementsTool]),
//       )
//       .addNode('showAnswer', this.showAnswer)
//       .addEdge('__start__', 'agent')
//       .addConditionalEdges('agent', checkIfUpdatingProblem)
//       .addEdge('showSolutionRequirements', 'showAnswer')
//       .addEdge('showAnswer', 'agent');

//     this.memory = new MemorySaver();
//     this.app = langgraph.compile({
//       checkpointer: this.memory,
//       interruptAfter: ['showAnswer'],
//     });
//   }

//   async stream(message: string) {
//     console.log('in problem agent stream()');
//     if (
//       (await this.app.getState(this.graphConfig)).values.messages?.length ??
//       0 === 0
//     ) {
//       await this.app.updateState(this.graphConfig, {
//         messages: [
//           new SystemMessage(
//             `Role: You are an expert at crafting problem statements.
//             Task: Determine if the user's problem statement is detailed enough. If it is, call the tool to summarise what the requirements of a solution for the overall problem statement.
//             Do not give a suggestion of the updated problem statement, unless the user is unable to improve on the problem statement after 3 prompts.
//             Output: You must always return an textual explanation in your response, and the problem statement based on the current context you have, without any improvements.,

//             Examples:
//             User: 60% of Singaporeans lack the knowledge of what can be recycled when disposing their trash. This results in them choosing not to recycle because of the additional effort required for research, resulting in low recycling rates.
//             Expert: Good! This is a detailed and specific problem statement that mentions a specific statistic of 60% and a specific nationality is part of the problem. It is clear what the problem is, who it affects, and why it is a problem.
//             Expert: Tool call to summarise requirements of the solution.
//             `,
//           ),
//         ],
//       });
//     }
//     console.log(
//       'state before calling stream()',
//       await this.app.getState(this.graphConfig),
//     );
//     return await this.app.stream(
//       {
//         messages: [new HumanMessage(message)],
//       },
//       this.graphConfig,
//     );
//   }
// }

// for await (const chunk of await stream) {
//   for (const [node, values] of Object.entries(chunk)) {
//     console.log(`Receiving update from node: ${node}`);
//     console.log(values);
//     console.log('\n====\n');
//   }
// }

// new AccessControlAgent(
//   () => console.log('navigating to problem'),
//   (message) => console.log(message),
// ).invoke('Are you happy?');
