import { DynamicStructuredTool } from '@langchain/core/tools';
import { AzureChatOpenAI, ChatOpenAI } from '@langchain/openai';

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
