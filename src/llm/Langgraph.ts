import { Document } from '@langchain/core/documents';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import {
  Annotation,
  CompiledStateGraph,
  MemorySaver,
  StateDefinition,
  StateGraph,
} from '@langchain/langgraph/web';
import { z } from 'zod';

import { Product } from '../pages/Chatbot';
import {
  chatAgentPrompt,
  featuresAgentPrompt,
  problemAgentPrompt,
  problemConstructorAgentPrompt,
  productsAgentPrompt1,
  productsAgentPrompt2,
} from './Prompts';
import { getOpenAIModel, problemConstructorAgentOutputSchema } from './Utils';
import { ChatAgentNode } from './node/ChatAgentNode';
import { DisplayedResponseUpdaterNode } from './node/DisplayedResponseUpdaterNode';
import { FeaturesAgentNode } from './node/FeaturesAgentNode';
import { ProblemAgentNode } from './node/ProblemAgentNode';
import { ProblemConstructorAgentNode } from './node/ProblemConstructorAgentNode';
import { ProductsAgentNode } from './node/ProductsAgentNode';

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
  products?: string[];
}

export const StateSchema = Annotation.Root({
  chatHistory: Annotation<BaseMessage[] | undefined>({
    // By defining the reducer, a node only needs to return new messages to update the state,
    // instead of returning previous and new messages
    reducer: (
      left: BaseMessage[] | undefined,
      right: BaseMessage[] | undefined,
    ) => {
      return [...(left ?? []), ...(right ?? [])];
    },
  }),

  // Provides context to model on last set of generated responses displayed to user
  // Updated whenever user submits input
  displayedResponses: Annotation<DisplayedResponses | undefined>,

  problemParts: Annotation<
    z.infer<typeof problemConstructorAgentOutputSchema> | undefined
  >,

  lastGeneratedChat: Annotation<AIMessage | undefined>,
  lastGeneratedProblem: Annotation<AIMessage | undefined>,
  lastGeneratedFeatures: Annotation<AIMessage | undefined>,

  lastGeneratedProducts: Annotation<string[] | undefined>,
});

export class HaveAnotLanggraph {
  problemConstructorAgentNode = new ProblemConstructorAgentNode(
    getOpenAIModel(0).withStructuredOutput(
      problemConstructorAgentOutputSchema,
      {
        strict: true,
      },
    ),
    'problemParts',
    problemConstructorAgentPrompt,
  );

  chatAgentNode = new ChatAgentNode(
    getOpenAIModel(),
    'lastGeneratedChat',
    chatAgentPrompt,
  );
  displayedChatUpdaterNode: DisplayedResponseUpdaterNode<'lastGeneratedChat'>;

  problemAgentNode = new ProblemAgentNode(
    getOpenAIModel(),
    'lastGeneratedProblem',
    problemAgentPrompt,
  );
  displayedProblemUpdaterNode: DisplayedResponseUpdaterNode<'lastGeneratedProblem'>;

  featuresAgentNode = new FeaturesAgentNode(
    getOpenAIModel(),
    'lastGeneratedFeatures',
    featuresAgentPrompt,
  );
  displayedFeaturesUpdaterNode: DisplayedResponseUpdaterNode<'lastGeneratedFeatures'>;

  productsAgentNode: ProductsAgentNode;
  displayedProductsUpdaterNode: DisplayedResponseUpdaterNode<'lastGeneratedProducts'>;

  setDisplayedChat: (chat: string) => void;
  setDisplayedProblem?: (problem: string) => void;
  setDisplayedFeatures?: (features: string) => void;
  setDisplayedProducts?: (products?: string[]) => void;

  productMap: Record<string, Product>;
  productDocs: Document[] = [];

  app: CompiledStateGraph<any, any, any, StateDefinition>;

  constructor(
    setDisplayedChat: (chat: string) => void,
    setDisplayedProblem: (problem: string) => void,
    setDisplayedFeatures: (features: string) => void,
    setDisplayedProducts: (products?: string[]) => void,
    productMap?: Record<string, Product>,
  ) {
    this.setDisplayedChat = setDisplayedChat;
    this.setDisplayedProblem = setDisplayedProblem;
    this.setDisplayedFeatures = setDisplayedFeatures;
    this.setDisplayedProducts = setDisplayedProducts;

    this.productMap = productMap ?? {};
    for (const [name, product] of Object.entries(this.productMap)) {
      if (!product['Short description']) {
        continue;
      }
      this.productDocs.push(
        new Document({
          pageContent: product['Short description'],
          metadata: { name },
        }),
      );
    }

    this.displayedChatUpdaterNode = new DisplayedResponseUpdaterNode(
      'lastGeneratedChat',
      (stateValue) => {
        const messageStr = stateValue?.content.toString();
        if (messageStr) {
          setDisplayedChat(messageStr);
        }
      },
    );
    this.displayedProblemUpdaterNode = new DisplayedResponseUpdaterNode(
      'lastGeneratedProblem',
      (stateValue) => {
        const messageStr = stateValue?.content.toString();
        if (messageStr) {
          setDisplayedProblem(messageStr);
        }
      },
    );
    this.displayedFeaturesUpdaterNode = new DisplayedResponseUpdaterNode(
      'lastGeneratedFeatures',
      (stateValue) => {
        const messageStr = stateValue?.content.toString();
        if (messageStr) {
          setDisplayedFeatures(messageStr);
        }
      },
    );
    // system prompt inspired from quickstart (https: //langchain-ai.github.io/langgraphjs/tutorials/rag/langgraph_adaptive_rag_local/?h=rag#answer-grader)
    this.productsAgentNode = new ProductsAgentNode(
      getOpenAIModel(0),
      'lastGeneratedProducts',
      productsAgentPrompt1,
      productsAgentPrompt2,
      this.productDocs,
      this.productMap,
    );
    this.displayedProductsUpdaterNode = new DisplayedResponseUpdaterNode(
      'lastGeneratedProducts',
      (stateValue) => {
        // if (stateValue && stateValue.length > 0) {
        setDisplayedProducts(stateValue);
        // }
      },
    );

    const langgraph = new StateGraph(StateSchema)
      .addNode(
        'problemConstructorAgent',
        this.problemConstructorAgentNode.invoke.bind(
          this.problemConstructorAgentNode,
        ),
      )
      .addNode('chatAgent', this.chatAgentNode.invoke.bind(this.chatAgentNode))
      .addNode(
        'displayedChatUpdater',
        this.displayedChatUpdaterNode.invoke.bind(
          this.displayedChatUpdaterNode,
        ),
      )
      .addNode(
        'problemAgent',
        this.problemAgentNode.invoke.bind(this.problemAgentNode),
      )
      .addNode(
        'displayedProblemUpdater',
        this.displayedProblemUpdaterNode.invoke,
      )
      .addNode(
        'featuresAgent',
        this.featuresAgentNode.invoke.bind(this.featuresAgentNode),
      )
      .addNode(
        'displayedFeaturesUpdater',
        this.displayedFeaturesUpdaterNode.invoke,
      )
      .addNode(
        'productsAgent',
        this.productsAgentNode.invoke.bind(this.productsAgentNode),
      )
      .addNode(
        'displayedProductsUpdater',
        this.displayedProductsUpdaterNode.invoke.bind(
          this.displayedProductsUpdaterNode,
        ),
      )

      .addEdge('__start__', 'problemConstructorAgent')
      .addEdge('problemConstructorAgent', 'chatAgent')
      .addEdge('chatAgent', 'displayedChatUpdater')
      .addEdge('displayedChatUpdater', 'problemAgent')
      .addEdge('problemAgent', 'displayedProblemUpdater')
      .addEdge('displayedProblemUpdater', 'featuresAgent')
      .addEdge('featuresAgent', 'displayedFeaturesUpdater')
      .addEdge('displayedFeaturesUpdater', 'productsAgent')
      .addEdge('productsAgent', 'displayedProductsUpdater')
      .addEdge('displayedProductsUpdater', 'chatAgent');

    this.app = langgraph.compile({
      checkpointer: new MemorySaver(),
      interruptAfter: ['displayedProductsUpdater'],
    });
  }

  async invoke(
    message: string,
    displayedResponses: DisplayedResponses,
    config: { configurable: { thread_id: number } },
  ) {
    return this.app.invoke(
      {
        chatHistory: [new HumanMessage(message)],
        displayedResponses: displayedResponses,
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
