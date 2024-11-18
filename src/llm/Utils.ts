import { DynamicStructuredTool } from '@langchain/core/tools';
import {
  AzureChatOpenAI,
  ChatOpenAI,
  OpenAIEmbeddings,
} from '@langchain/openai';
import { z } from 'zod';

export const getOpenAIModel = (temperature: number = 1) =>
  new ChatOpenAI({
    openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
    model: 'gpt-4o-mini',
    temperature: temperature,
  });

export const getOpenAIModelWithTools = (
  tools: DynamicStructuredTool<any>[],
  temperature: number,
) => getOpenAIModel(temperature).bindTools(tools);

export const getOpenAIEmbeddings = () =>
  new OpenAIEmbeddings({
    openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY as string,
    model: 'text-embedding-3-large',
  });

export const getAzureOpenAIModel = () =>
  new AzureChatOpenAI({
    azureOpenAIApiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY as string,
    azureOpenAIApiVersion: import.meta.env
      .VITE_AZURE_OPENAI_API_VERSION as string,
    azureOpenAIBasePath: import.meta.env.VITE_AZURE_OPENAI_BASE_PATH as string,
    azureOpenAIApiDeploymentName: import.meta.env
      .VITE_AZURE_OPENAI_API_DEPLOYMENT_NAME as string,
  });

export const getAzureOpenAIModelWithTools = (
  tools: DynamicStructuredTool<any>[],
) => getAzureOpenAIModel().bindTools(tools);

export const problemConstructorAgentOutputSchema = z
  .object({
    who: z
      .object({
        answer: z
          .string()
          .describe(`The answer to "Who is affected by the problem?"`),
        score: z
          .number()
          .describe(
            `The score of the answer to "Who is affected by the problem?"`,
          ),
        missing: z
          .string()
          .describe(`Concretely, what else is necessary for a score of 1`),
      })
      .nullable(),
    what: z
      .object({
        answer: z
          .string()
          .describe(
            `The answer to "What are the pain points you’re trying to solve or you currently face?"`,
          ),
        score: z
          .number()
          .describe(
            `The score of the answer to "What are the pain points you’re trying to solve or you currently face?"`,
          ),
        missing: z
          .string()
          .describe(`Concretely, what else is necessary for a score of 1`),
      })
      .nullable(),
    where: z
      .object({
        answer: z
          .string()
          .describe(`The answer to "Where is the problem occurring?"`),
        score: z
          .number()
          .describe(
            `The score of the answer to "Where is the problem occurring?"`,
          ),
        missing: z
          .string()
          .describe(`Concretely, what else is necessary for a score of 1`),
      })
      .nullable(),
    when: z
      .object({
        answer: z
          .string()
          .describe(`The answer to "When does the problem occur?"`),
        score: z
          .number()
          .describe(
            `The score of the answer to "When does the problem occur?"`,
          ),
        missing: z
          .string()
          .describe(`Concretely, what else is necessary for a score of 1`),
      })
      .nullable(),
    why: z
      .object({
        answer: z
          .string()
          .describe(
            `The answer to "Why is the problem important or worth solving?"`,
          ),
        score: z
          .number()
          .describe(
            `The score of the answer to "Why is the problem important or worth solving?"`,
          ),
        missing: z
          .string()
          .describe(`Concretely, what else is necessary for a score of 1`),
      })
      .nullable(),
  })
  .describe(
    'Concise answers to questions for the problem statement. This will not be shown to the user.',
  );

export const featuresAgentOutputSchema = z.object({
  requirementGroups: z.array(
    z.object({
      uniqueId: z
        .number()
        .describe(
          `An automatically incrementing ID that uniquely identifies the requirement group`,
        ),
      header: z.string().describe(`The header of the requirement group`),
      features: z.array(
        z
          .object({
            uniqueId: z
              .number()
              .describe(
                `An automatically incrementing ID that uniquely identifies a requirement`,
              ),
            feature: z.string().describe(`The feature to be displayed`),
          })
          .describe(`A list of features to be displayed under the header.`),
      ),
    }),
  ),
});

export const getFeaturesFromOutputSchema = (
  schema?: z.infer<typeof featuresAgentOutputSchema>,
): string | undefined =>
  schema?.requirementGroups
    .map(
      ({ header, features }) =>
        `**${header}**  \n  ${features.map((obj, i) => `${i + 1}. ${obj.feature}`).join('  \n')}`,
    )
    .join('  \n  \n');
