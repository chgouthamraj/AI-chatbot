import { OpenAIEmbeddings } from "@langchain/openai";
import { config } from "../config/index.js";

let _embeddings;

/**
 * Returns the shared OpenAIEmbeddings instance (lazy singleton).
 * Lazy so it's only constructed when first needed, not at import time.
 * @returns {OpenAIEmbeddings}
 */
export function getEmbeddings() {
  if (!_embeddings) {
    _embeddings = new OpenAIEmbeddings({
      openAIApiKey: config.openai.apiKey,
      modelName: config.openai.embeddingModel,
    });
  }
  return _embeddings;
}
