import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { config } from "../config/index.js";

/**
 * Creates a new text splitter configured from env.
 * Returns a new instance on each call because the splitter is stateful
 * during createDocuments() — sharing one across concurrent requests would
 * cause race conditions.
 * @returns {RecursiveCharacterTextSplitter}
 */
export function createSplitter() {
  return new RecursiveCharacterTextSplitter({
    chunkSize: config.chunking.chunkSize,
    chunkOverlap: config.chunking.chunkOverlap,
    separators: ["\n\n", "\n", " ", ""],
  });
}
