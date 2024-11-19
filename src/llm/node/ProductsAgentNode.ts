import { Document } from '@langchain/core/documents';
import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { ChatOpenAICallOptions } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';
import { z } from 'zod';

import { Product } from '../../pages/Chatbot';
import { StateSchema } from '../Langgraph';
import {
  getFeaturesFromOutputSchema,
  getOpenAIEmbeddings,
  getOpenAIModel,
  getProductsAgentOutputSchema,
  productsAgentRAGQuestionsOutputSchema,
} from '../Utils';
import { StructuredOutputAgentNode } from './StructuredOutputAgentNode';

export class ProductsAgentNode extends StructuredOutputAgentNode<'lastGeneratedProductIds'> {
  modelForRAG: Runnable<
    BaseLanguageModelInput,
    z.infer<typeof productsAgentRAGQuestionsOutputSchema>,
    ChatOpenAICallOptions
  >;
  systemPromptForRAG: string;
  productDocs: Document[];
  productMap: Map<number, Product>;
  retrievedProductIdNamesAndDescriptions: {
    id: number;
    productName: string;
    description: string;
  }[];
  retriever?: VectorStoreRetriever<MemoryVectorStore>;

  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      (typeof StateSchema.State)['lastGeneratedProductIds'],
      ChatOpenAICallOptions
    >,
    stateKey: 'lastGeneratedProductIds',
    systemPrompt: string,
    systemPromptForRAG: string,
    productDocs: Document[],
    productMap: Map<number, Product>,
  ) {
    super(model, stateKey, systemPrompt);
    this.modelForRAG = getOpenAIModel(0).withStructuredOutput(
      productsAgentRAGQuestionsOutputSchema,
      { strict: true },
    );
    this.systemPromptForRAG = systemPromptForRAG;
    this.productDocs = productDocs;
    this.productMap = productMap;
    this.retrievedProductIdNamesAndDescriptions = productDocs.map((doc) => ({
      id: Number(doc.id!), // assume Document has been given an ID corresponding to the index in the product map in App.tsx
      productName: doc.metadata['name'],
      description:
        this.productMap.get(Number(doc.id!))?.['Short description'] ?? '',
    }));
  }

  getCommonSystemMessageString(state: typeof StateSchema.State) {
    return `Here is the latest problem statement:
      ${state.lastGeneratedProblem?.content ?? '<empty>'}

      Here are the latest solution features:
      ${getFeaturesFromOutputSchema(state.lastGeneratedFeatures) ?? '<empty>'}

      Here are the previously generated states:
      Problem: ${state.displayedResponses?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.productIds ?? '<empty>'}`;
  }

  override getSystemMessage(state: typeof StateSchema.State) {
    const systemMessage = new SystemMessage(
      `${this.systemPrompt}

      Here are the suggested products that could help address the problem:
      ${this.retrievedProductIdNamesAndDescriptions.map((x) => `{ "id": ${x.id}, "productName": ${x.productName}, "description": ${x.description}}`).join('\n')}

      ${this.getCommonSystemMessageString(state)}`,
    );
    return systemMessage;
  }

  getSystemMessageForRAG(state: typeof StateSchema.State) {
    return new SystemMessage(
      `${this.systemPromptForRAG}

      ${this.getCommonSystemMessageString(state)}`,
    );
  }

  async ragToGetPotentialProductIds(questions: string[]) {
    console.log('Questions being used for RAG:', questions);

    if (!this.retriever) {
      const embeddings = getOpenAIEmbeddings();
      const vectorstore = new MemoryVectorStore(embeddings);
      console.log('Adding documents to vectorstore:', this.productDocs);
      await vectorstore.addDocuments(this.productDocs);
      const retriever = vectorstore.asRetriever({ k: 3 });
      this.retriever = retriever;
    }

    const productCountMap: Map<number, number> = new Map();
    for (const question of questions) {
      const retrievedDocs: Document[] = await this.retriever.invoke(question);
      console.log(
        'Products retrieved for question:',
        question,
        retrievedDocs.map((doc) => doc.metadata['name']),
      );
      for (const doc of retrievedDocs) {
        const count = productCountMap.get(Number(doc.id!)) ?? 0;
        productCountMap.set(Number(doc.id!), count + 1);
      }
    }
    console.log('Product count map:', productCountMap);

    const potentialProductIds = [];
    for (const [productId, count] of productCountMap) {
      // disable filtering by count to increase the number of products suggested
      if (count >= 2 && this.productMap.has(productId)) {
        potentialProductIds.push(productId);
      }
    }

    return potentialProductIds;
  }

  async invokeToGenerateRAGQuestions(
    state: typeof StateSchema.State,
  ): Promise<z.infer<typeof productsAgentRAGQuestionsOutputSchema>> {
    const systemMessage = this.getSystemMessageForRAG(state);

    const messages = [
      systemMessage,
      // for all tool messages, set their content field as '' if it is undefined
      ...(state.chatHistory ?? []).map((message) => {
        if (message._getType() === 'tool' && message.content === undefined) {
          message.content = '';
        }
        return message;
      }),
    ];

    const response = await this.modelForRAG.invoke(messages);

    return response;
  }

  override async invoke(state: typeof StateSchema.State) {
    const { prompts: ragQuestions } =
      await this.invokeToGenerateRAGQuestions(state);
    const potentialProductIds =
      await this.ragToGetPotentialProductIds(ragQuestions);
    const potentialProductIdNamesAndDescriptions = potentialProductIds
      .map((id) => {
        const product = this.productMap.get(id);
        if (!product) {
          return;
        } else {
          return {
            id: id, // assume Document has been given an ID corresponding to the index in the product map in App.tsx
            productName: product.Product,
            description: product['Short description'],
          };
        }
      })
      .filter((x) => x !== undefined);

    console.log(
      'retrievedProductIdNamesAndDescriptions:',
      potentialProductIdNamesAndDescriptions,
    );
    this.retrievedProductIdNamesAndDescriptions =
      potentialProductIdNamesAndDescriptions;
    this.model = getOpenAIModel(0).withStructuredOutput(
      getProductsAgentOutputSchema(potentialProductIds),
    );
    const response = await super.invoke(state);

    return response;
  }
}
