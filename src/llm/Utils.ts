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

export const getUniqueProductsToBeDisplayedByScore = (
  products?: z.infer<ReturnType<typeof getProductsAgentOutputSchema>>,
) => {
  const MIN_SCORE_DISPLAYED_PRODUCT_ID = 0.6;

  const productIdsSet = new Set(
    products?.productIds.map((obj) => obj.productId),
  );
  const uniqueFilteredProducts =
    products?.productIds.filter(
      (obj) =>
        productIdsSet.delete(obj.productId) &&
        obj.score >= MIN_SCORE_DISPLAYED_PRODUCT_ID,
    ) ?? [];
  return { productIds: uniqueFilteredProducts };
};

export const getFeaturesFromOutputSchema = (
  schema?: z.infer<typeof featuresAgentOutputSchema>,
): string | undefined =>
  schema?.requirementGroups
    .map(
      ({ header, features }) =>
        `### ${header}\n\n${features.map(({ feature }, i) => `${i + 1}. ${feature}`).join('\n')}`,
    )
    .join('\n\n');

export const getRequirementProductMappingsToBeDisplayedByScore = (
  requirementProductMappings?: z.infer<
    ReturnType<typeof getRequirementProductMappingAgentOutputSchema>
  >,
) => {
  const MIN_SCORE_DISPLAYED_REQUIREMENT_PRODUCT_MAPPING = 0.7;

  const filteredRequirementProductMappings =
    requirementProductMappings?.requirementsToProductMappings?.filter(
      (obj) => obj.score >= MIN_SCORE_DISPLAYED_REQUIREMENT_PRODUCT_MAPPING,
    ) ?? [];
  return {
    requirementsToProductMappings: filteredRequirementProductMappings,
  };
};

// adds <ProductHoverCard /> JSX to features that have a product mapping, then calls getFeaturesFromOutputSchema
export const getFeaturesWithProductJSXFromOutputSchemas = (
  requirements?: z.infer<typeof featuresAgentOutputSchema>,
  displayedProducts?: z.infer<ReturnType<typeof getProductsAgentOutputSchema>>,
  requirementProductMappings?: z.infer<
    ReturnType<typeof getRequirementProductMappingAgentOutputSchema>
  >,
): string | undefined => {
  const requirementGroups = requirements?.requirementGroups;
  const displayedProductIds = displayedProducts?.productIds.map(
    (product) => product.productId,
  );
  if (!requirementGroups || !displayedProductIds) {
    return undefined;
  }

  const requirementProductMappingsToBeDisplayed =
    getRequirementProductMappingsToBeDisplayedByScore(
      requirementProductMappings,
    ).requirementsToProductMappings;
  const requirementGroupsWithProductJSX = requirementGroups.map(
    ({ uniqueId: requirementGroupUniqueId, header, features }) => {
      const featuresWithProductJSX = features.map(
        ({ uniqueId: featureUniqueId, feature }) => {
          const matchedMapping = requirementProductMappingsToBeDisplayed?.find(
            (mapping) =>
              mapping.uniqueIdRequirementGroup === requirementGroupUniqueId &&
              mapping.uniqueIdFeature === featureUniqueId,
          );
          if (matchedMapping) {
            return {
              uniqueId: featureUniqueId,
              feature:
                feature +
                ` <ProductHoverCard productId="${matchedMapping.productId}" label="${displayedProductIds.indexOf(matchedMapping.productId) + 1}" />`,
            };
          } else {
            return { uniqueId: featureUniqueId, feature };
          }
        },
      );

      return {
        uniqueId: requirementGroupUniqueId,
        header: header,
        features: featuresWithProductJSX,
      };
    },
  );

  return getFeaturesFromOutputSchema({
    requirementGroups: requirementGroupsWithProductJSX,
  });
};

export const getProductsAgentOutputSchema = (
  potentialProductsIds: Array<number>,
) =>
  z.object({
    productIds: z.array(
      z.object({
        productId:
          potentialProductsIds.length == 0
            ? z.number()
            : potentialProductsIds.length == 1
              ? z.literal(potentialProductsIds[0])
              : z.union(
                  potentialProductsIds.map((p) => z.literal(p)) as [
                    z.ZodLiteral<number>,
                    z.ZodLiteral<number>,
                    ...z.ZodLiteral<number>[],
                  ],
                ),
        score: z
          .number()
          .describe('Score between 0 and 1 of the relevance of the product'),
      }),
    ),
  });

export const getRequirementProductMappingAgentOutputSchema = (
  potentialProductsIds: Array<number>,
) =>
  z.object({
    requirementsToProductMappings: z
      .array(
        z.object({
          uniqueIdRequirementGroup: z
            .number()
            .describe(`The unique ID of the requirement group`),
          uniqueIdFeature: z.number().describe(`The unique ID of the feature`),
          productId:
            potentialProductsIds.length == 0
              ? z.number()
              : potentialProductsIds.length == 1
                ? z.literal(potentialProductsIds[0])
                : z.union(
                    potentialProductsIds.map((p) => z.literal(p)) as [
                      z.ZodLiteral<number>,
                      z.ZodLiteral<number>,
                      ...z.ZodLiteral<number>[],
                    ],
                  ),
          score: z
            .number()
            .describe(
              'Score between 0 and 1 of how relevant the product is to the requirement',
            ),
        }),
      )
      .describe(
        'Each item is a mapping of products to a requirement, null if no mappings',
      )
      .nullable(),
  });

export const productsAgentRAGQuestionsOutputSchema = z.object({
  prompts: z.array(z.string().describe('A prompt for vector store retrieval')),
});
