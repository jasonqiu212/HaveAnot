import { Document } from '@langchain/core/documents';
import { BaseLanguageModelInput } from '@langchain/core/language_models/base';
import { AIMessageChunk, SystemMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { VectorStoreRetriever } from '@langchain/core/vectorstores';
import { ChatOpenAICallOptions } from '@langchain/openai';
import { MemoryVectorStore } from 'langchain/vectorstores/memory';

import { Product } from '../../pages/Chatbot';
import { StateSchema } from '../Langgraph';
import { getFeaturesFromOutputSchema, getOpenAIEmbeddings } from '../Utils';
import { AgentNode } from './AgentNode';

export class ProductsAgentNode extends AgentNode<'lastGeneratedProducts'> {
  systemPrompt2: string;
  productDocs: Document[];
  productMap: Record<string, Product>;
  retriever?: VectorStoreRetriever<MemoryVectorStore>;

  constructor(
    model: Runnable<
      BaseLanguageModelInput,
      AIMessageChunk,
      ChatOpenAICallOptions
    >,
    stateKey: 'lastGeneratedProducts',
    systemPrompt: string,
    systemPrompt2: string,
    productDocs: Document[],
    productMap: Record<string, Product>,
  ) {
    super(model, stateKey, systemPrompt);
    this.systemPrompt2 = systemPrompt2;
    this.productDocs = productDocs;
    this.productMap = productMap;
  }

  getCommonSystemMessageString(state: typeof StateSchema.State) {
    return `Here is the latest problem statement:
      ${state.lastGeneratedProblem ?? '<empty>'}

      Here are the latest solution features:
      ${getFeaturesFromOutputSchema(state.lastGeneratedFeatures) ?? '<empty>'}

      Here are the previously generated states:
      Problem: ${state.displayedResponses?.problem ?? '<empty>'}
      Suggested Solution Features: ${state.displayedResponses?.features ?? '<empty>'}
      Suggested Products: ${state.displayedResponses?.products ?? '<empty>'}`;
  }

  override getSystemMessage(state: typeof StateSchema.State) {
    return new SystemMessage(
      `${this.systemPrompt}

      ${this.getCommonSystemMessageString(state)}`,
    );
  }

  getSystemMessage2(
    state: typeof StateSchema.State,
    potentialProducts: string[],
  ) {
    return new SystemMessage(
      `${this.systemPrompt2}

      Here are the potential products to choose from:
      ${potentialProducts.reduce((acc, product) => `${acc}\n${product}: ${this.productMap[product]['Short description']}`, '')}

      ${this.getCommonSystemMessageString(state)}`,
    );
  }

  override async invoke(state: typeof StateSchema.State) {
    if (!this.retriever) {
      const embeddings = getOpenAIEmbeddings();
      const vectorstore = new MemoryVectorStore(embeddings);
      console.log(this.productDocs);
      await vectorstore.addDocuments(this.productDocs);
      const retriever = vectorstore.asRetriever({ k: 3 });
      this.retriever = retriever;
    }

    const systemMessage = this.getSystemMessage(state);

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

    const response = await this.model.invoke(messages);
    const questions = response.content
      .toString()
      .split('\n')
      .filter((line) => line !== '');
    console.log('Questions being used for RAG:', questions);

    const productCountMap: Record<string, number> = {};
    for (const question of questions) {
      const retrievedDocs: Document[] = await this.retriever.invoke(question);
      console.log(
        'Products retrieved for question:',
        question,
        retrievedDocs.map((doc) => doc.metadata['name']),
      );
      for (const doc of retrievedDocs) {
        const productName: string = doc.metadata['name'];
        productCountMap[productName] = productCountMap[productName] ?? 0 + 1;
      }
    }
    console.log('Product to count map:', productCountMap);

    const potentialProducts = [];
    for (const [product, _] of Object.entries(productCountMap)) {
      // disable filtering by count to increase the number of products suggested
      // if (count >= 2) {
      potentialProducts.push(product);
      // }
    }

    const systemMessage2 = this.getSystemMessage2(state, potentialProducts);
    const messages2 = [
      systemMessage2,
      // for all tool messages, set their content field as '' if it is undefined
      ...(state.chatHistory ?? []).map((message) => {
        if (message._getType() === 'tool' && message.content === undefined) {
          message.content = '';
        }
        return message;
      }),
    ];
    const response2 = await this.model.invoke(messages2);

    // remove leading and trailing dashes/whitespace
    const suggestedProducts = response2.content
      .toString()
      .split('\n')
      .map((line) => line.trim().replace(/^-+|-+$/g, ''));
    console.log('Suggested products response:', suggestedProducts);

    // additional parsing to reduce chances that suggestedProducts don't match the productMap
    const filteredSuggestedProducts: string[] = [];
    suggestedProducts.forEach((str) => {
      // split by comma and trim whitespace
      const suggestedProductArr = str.split(',').map((s) => s.trim());

      suggestedProductArr.forEach((suggestedProduct) => {
        let product: string | undefined;
        if (!(suggestedProduct in this.productMap)) {
          product = Object.keys(this.productMap).find((product) =>
            suggestedProduct.toLowerCase().includes(product.toLowerCase()),
          );
        } else {
          product = suggestedProduct;
        }
        product ? filteredSuggestedProducts.push(product) : undefined;
      });
    });
    console.log('Filtered suggested products:', filteredSuggestedProducts);

    return { [this.stateKey]: filteredSuggestedProducts };
  }
}
