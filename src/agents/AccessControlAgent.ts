import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import {
  AIMessage,
  AIMessageChunk,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { DynamicStructuredTool, tool } from '@langchain/core/tools';
import { ToolNode } from '@langchain/langgraph/prebuilt';
import {
  Annotation,
  CompiledStateGraph,
  StateGraph,
} from '@langchain/langgraph/web';
import { AzureChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { ZodObject, ZodString, ZodTypeAny, z } from 'zod';

// keep message history as one list of messages
const StateAnnotation = Annotation.Root({
  messages: Annotation<AIMessage[]>({
    reducer: (left: AIMessage[], right: AIMessage[]) => [...left, ...right],
  }),
});

const getModelResponse = async (
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatOpenAICallOptions
  >,
  state: typeof StateAnnotation.State,
) => {
  const response = await model.invoke(state.messages);

  // We return a list, because this will get added to the existing list
  return { messages: [response] };
};

const checkAllowAccess = ({ messages }: typeof StateAnnotation.State) => {
  const lastMessage = messages[messages.length - 1];

  if (lastMessage.tool_calls?.length ?? 0 > 0) {
    switch (lastMessage.tool_calls?.[0].name ?? '') {
      case 'navigateToApplication': {
        console.log('navigating to problem stage');
        return 'navigateToProblemStage';
      }
      case 'explainUnauthorisedAccess': {
        console.log('showing unauthorized explanation');
        return 'showUnauthorizedExplanation';
      }
      default: {
        console.log('Error with bot');
        return '__end__';
      }
    }
  } else {
    console.log('Error with bot');
    return '__end__';
  }
};

export class AccessControlAgent {
  navigateToProblemStageTool: DynamicStructuredTool;
  showUnauthorizedExplanationTool: DynamicStructuredTool<
    ZodObject<
      { message: ZodString },
      'strip',
      ZodTypeAny,
      { message: string },
      { message: string }
    >
  >;
  tools: DynamicStructuredTool<any>[];
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatOpenAICallOptions
  >;
  app: CompiledStateGraph<any, any, any, any>;

  constructor(
    navigateToProblemStageCallback: () => void,
    showUnauthorizedExplanationCallback: (message: string) => void,
  ) {
    this.navigateToProblemStageTool = tool(navigateToProblemStageCallback, {
      name: 'navigateToApplication',
      description: 'Navigate to the application',
      schema: z.object({}),
    });
    this.showUnauthorizedExplanationTool = tool(
      ({ message }) => showUnauthorizedExplanationCallback(message),
      {
        name: 'explainUnauthorisedAccess',
        description: 'Explain why access is unauthorized',
        schema: z.object({
          message: z.string().describe('Message to show to the user'),
        }),
      },
    );
    this.tools = [
      this.navigateToProblemStageTool,
      this.showUnauthorizedExplanationTool,
    ];

    this.model = new AzureChatOpenAI({
      azureOpenAIApiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY as string,
      azureOpenAIApiVersion: import.meta.env
        .VITE_AZURE_OPENAI_API_VERSION as string,
      azureOpenAIBasePath: import.meta.env
        .VITE_AZURE_OPENAI_BASE_PATH as string,
      azureOpenAIApiDeploymentName: import.meta.env
        .VITE_AZURE_OPENAI_API_DEPLOYMENT_NAME as string,
    }).bindTools(this.tools);

    const langgraph = new StateGraph(StateAnnotation)
      .addNode('agent', (state) => getModelResponse(this.model, state))
      .addNode(
        'navigateToProblemStage',
        new ToolNode([this.navigateToProblemStageTool]),
      )
      .addNode(
        'showUnauthorizedExplanation',
        new ToolNode([this.showUnauthorizedExplanationTool]),
      )
      .addEdge('__start__', 'agent')
      .addConditionalEdges('agent', checkAllowAccess);

    this.app = langgraph.compile();
  }

  async invoke(message: string) {
    const messages = await this.app.invoke({
      messages: [
        new SystemMessage(
          'You are a bot that prevents unauthorized access to an application. You should only allow access to the application if the user is describing a problem that could be solved with technology, or is describing a technology solution. Otherwise, explain why access is unauthorized.',
        ),
        new HumanMessage(message),
        // new HumanMessage('I want to build an app.'),
        //   new HumanMessage(
        //     'I want to have a system that helps me collect form data',
        //   ),
      ],
    });
    console.log(messages);
  }
}

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
