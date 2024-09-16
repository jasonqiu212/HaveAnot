import { tool } from '@langchain/core/tools';
import { createReactAgent } from '@langchain/langgraph/prebuilt';
import { AzureChatOpenAI } from '@langchain/openai';
import 'dotenv/config';
import { z } from 'zod';

// TODO: make this into an interface

const model = new AzureChatOpenAI();

const getWeather = tool(
  (input) => {
    if (['sf', 'san francisco'].includes(input.location.toLowerCase())) {
      return "It's 60 degrees and foggy.";
    } else {
      return "It's 90 degrees and sunny.";
    }
  },
  {
    name: 'get_weather',
    description: 'Call to get the current weather.',
    schema: z.object({
      location: z.string().describe('Location to get the weather for.'),
    }),
  },
);

const tools = [getWeather];
const agent = createReactAgent({ llm: model, tools });

const inputs = {
  messages: [{ role: 'user', content: 'what is the weather in SF?' }],
};

const stream = await agent.stream(inputs, { streamMode: 'values' });

for await (const { messages } of stream) {
  console.log(messages);
}
// Returns the messages in the state at each step of execution
