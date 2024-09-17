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
  MemorySaver,
  StateGraph,
} from '@langchain/langgraph/web';
import { AzureChatOpenAI, ChatOpenAICallOptions } from '@langchain/openai';
import { ZodObject, ZodString, ZodTypeAny, z } from 'zod';

import { Message } from '../pages/Chatbot';

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
  console.log('in get model response');
  console.log(state);
  // console.log(
  //   state.messages.filter((message) =>
  //     ['ai', 'human', 'system'].includes(message._getType()),
  //   ),
  // );
  const response = await model.invoke(
    state.messages.map((message) => {
      if (message._getType() === 'tool' && message.content === undefined) {
        message.content = '';
      }
      return message;
    }),
    // state.messages.filter((message) =>
    //   ['ai', 'human', 'system'].includes(message._getType()),
    // ),
  );
  // We return a list, because this will get added to the existing list
  return { messages: [response] };
};

const checkIfUpdatingProblem = ({ messages }: typeof StateAnnotation.State) => {
  const lastMessage = messages[messages.length - 1];

  if (lastMessage.tool_calls?.length ?? 0 > 0) {
    switch (lastMessage.tool_calls?.[0].name ?? '') {
      case 'updateProblemTool': {
        console.log('updating problem statement');
        return 'updateProblem';
      }
      default: {
        console.log("tools don't match the given tools, showing answer");
        return 'showAnswer';
      }
    }
  } else {
    console.log('not using any tools, showing answer');
    return 'showAnswer';
  }
};

// TODO: on error, instead of console.log('Error with bot'), show a modal to the user
export class ProblemStatementAgent {
  // start with an agent node and an answer node connected by conditional edge; interruptBefore at the agent node to wait for user input
  // conditional edge prevents going to answer node if other conditional edges from agent are true
  // call tool node with conditional edge, user can set a boolean in a state after clicking how
  // tool node invokes model, and calls another tool node to show examples to user + add examples as an AI message to the state + a message that the AI has generated examples, which then leads to the answer node
  // keeps the examples in the message history for future calls
  // clicking on an example highlights it, and sets it in the state after submitting message
  // if this is set, the conditional edge leads to a tool node to check if this message answers the example
  // if it does, call another tool to remove the example, which then leads to the answer node
  // if it doesn't, go straight to the answer node with explanation why

  // need to ensure agent proactively tries to help write an example problem statement if taking too many prompts

  updateProblemTool: DynamicStructuredTool<
    ZodObject<
      { problem: ZodString },
      'strip',
      ZodTypeAny,
      { problem: string },
      { problem: string }
    >
  >;
  tools: DynamicStructuredTool<any>[];
  showAnswer: (state: typeof StateAnnotation.State) => Promise<any>;
  model: Runnable<
    BaseLanguageModelInput,
    AIMessageChunk,
    ChatOpenAICallOptions
  >;
  app: CompiledStateGraph<any, any, any, any>;
  graphConfig = {
    configurable: { thread_id: '1' },
    streamMode: 'updates' as const,
  };
  memory: MemorySaver;

  constructor(
    updateProblemCallback: (problem: string) => void,
    showAnswerCallback: (message: Message) => void,
  ) {
    this.updateProblemTool = tool(
      ({ problem }) => updateProblemCallback(problem),
      {
        name: 'updateProblemTool',
        description: 'Set or update the problem statement',
        schema: z.object({
          problem: z
            .string()
            .describe('A description of the problem statement'),
        }),
      },
    );
    this.tools = [this.updateProblemTool];

    this.showAnswer = async (state: typeof StateAnnotation.State) => {
      console.log('in show answer');
      console.log(state);
      if (state.messages.length > 0) {
        let i = state.messages.length - 1;
        while (
          i >= 0 &&
          !['ai', 'human'].includes(state.messages[i]._getType())
        ) {
          console.log(`message ${i}, ${state.messages[i]._getType()}`);
          i--;
        }
        const lastHumanOrAIMessage = state.messages[i];
        console.log(lastHumanOrAIMessage, lastHumanOrAIMessage._getType());
        switch (lastHumanOrAIMessage._getType()) {
          case 'ai': {
            showAnswerCallback({
              role: 'AI',
              text: lastHumanOrAIMessage.content.toString(),
            });
            break;
          }
          case 'human': {
            showAnswerCallback({
              role: 'Human',
              text: lastHumanOrAIMessage.content.toString(),
            });
            break;
          }
        }
      }
    };
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
      .addNode('updateProblem', new ToolNode([this.updateProblemTool]))
      .addNode('showAnswer', this.showAnswer)
      .addEdge('__start__', 'agent')
      .addConditionalEdges('agent', checkIfUpdatingProblem)
      .addEdge('updateProblem', 'showAnswer')
      .addEdge('showAnswer', 'agent');

    this.memory = new MemorySaver();
    this.app = langgraph.compile({
      checkpointer: this.memory,
      interruptAfter: ['showAnswer'],
    });
  }

  async stream(message: string) {
    console.log('in problem agent stream()');
    if (
      (await this.app.getState(this.graphConfig)).values.messages?.length ??
      0 === 0
    ) {
      await this.app.updateState(this.graphConfig, {
        messages: [
          new SystemMessage(
            `Role: You are an expert at crafting problem statements. 
            Task: Determine if the user's problem statement is detailed enough. If it is, call the tool to update the problem statement. 
            Do not give a suggestion of the updated problem statement, unless the user is unable to improve on the problem statement after 3 prompts.
            Output: You must always return an textual explanation in your response, and the problem statement based on the current context you have, without any improvements.,

            Examples:
            User: 60% of Singaporeans lack the knowledge of what can be recycled when disposing their trash. This results in them choosing not to recycle because of the additional effort required for research, resulting in low recycling rates.
            Expert: Good! This is a detailed and specific problem statement that mentions a specific statistic of 60% and a specific nationality is part of the problem. It is clear what the problem is, who it affects, and why it is a problem.
            Expert: Tool call to update problem statement.
            `,
          ),
        ],
      });
    }
    console.log(
      'state before calling stream()',
      await this.app.getState(this.graphConfig),
    );
    return await this.app.stream(
      {
        messages: [new HumanMessage(message)],
      },
      this.graphConfig,
    );
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
