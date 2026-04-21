import { config } from "../config/index.js";
import { getVectorStore } from "../vector-storage/index.js";

let _retriever;

/**
 * Returns the shared LangChain retriever (lazy singleton).
 * Built from the vector store with k from config.
 * @returns {import("@langchain/core/retrievers").BaseRetriever}
 */
export function getRetriever() {
  if (!_retriever) {
    _retriever = getVectorStore().asRetriever({ k: config.retrieval.topK });
  }
  return _retriever;
}
