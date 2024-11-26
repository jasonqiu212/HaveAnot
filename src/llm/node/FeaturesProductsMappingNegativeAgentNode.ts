import { Document } from '@langchain/core/documents';
import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatOpenAICallOptions } from '@langchain/openai';

import { Product } from '../../pages/Chatbot';
import { StateSchema } from '../Langgraph';
import {
  getOpenAIModel,
  getRequirementProductMappingAgentOutputSchema,
  getUniqueProductsToBeDisplayedByScore,
} from '../Utils';
import { StructuredOutputAgentNode } from './StructuredOutputAgentNode';

export class FeaturesProductsMappingNegativeAgentNode extends StructuredOutputAgentNode<'lastGeneratedRequirementsToProducts'> {
  productDocs: Document[];
  productMap: Map<number, Product>;
  chosenProductIds: number[];

  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      (typeof StateSchema.State)['lastGeneratedRequirementsToProducts'],
      ChatOpenAICallOptions
    >,
    stateKey: 'lastGeneratedRequirementsToProducts',
    systemPrompt: string,
    productDocs: Document[],
    productMap: Map<number, Product>,
  ) {
    super(model, stateKey, systemPrompt);
    this.productDocs = productDocs;
    this.productMap = productMap;
    this.chosenProductIds = [];
  }

  override getSystemMessages(state: typeof StateSchema.State) {
    const systemMessage = new SystemMessage(
      `${this.systemPrompt}

      Here are the suggested products that could help address the problem:
      ${this.chosenProductIds
        .filter((id) => this.productMap.has(id))
        .map(
          (id) =>
            `{ "id": ${id}, "productName": ${this.productMap.get(id)!.Product}, "description": ${this.productMap.get(id)!['Short description']}}`,
        )
        .join('\n')}

      Here is the current mapping of requirements to products:
      ${
        state.lastGeneratedRequirementsToProducts?.requirementsToProductMappings
          ? JSON.stringify(
              state.lastGeneratedRequirementsToProducts
                .requirementsToProductMappings,
              null,
              2,
            )
          : '<empty>'
      }

      Here is the latest problem statement:
      ${state.lastGeneratedProblem?.content ?? '<empty>'}

      Here are the latest solution features:
      ${
        state.lastGeneratedFeatures
          ? JSON.stringify(state.lastGeneratedFeatures, null, 2)
          : '<empty>'
      }

      Here are the previously generated states:
      Problem: ${state.displayedResponses?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.productIds ?? '<empty>'}`,
    );
    console.log(
      'FeaturesProductsMappingNegativeAgentNode systemMessage:',
      systemMessage,
    );
    return [systemMessage];
  }

  override async invoke(state: typeof StateSchema.State) {
    const dedupProductIds = getUniqueProductsToBeDisplayedByScore(
      state.lastGeneratedProductIds,
    ).productIds.map((obj) => obj.productId);
    this.chosenProductIds = dedupProductIds;

    this.model = getOpenAIModel(0).withStructuredOutput(
      getRequirementProductMappingAgentOutputSchema(this.chosenProductIds),
      { strict: true },
    );

    const response = await super.invoke(state);
    console.log('FeaturesProductsMappingNegativeAgentNode response:', response);
    return response;
  }
}
