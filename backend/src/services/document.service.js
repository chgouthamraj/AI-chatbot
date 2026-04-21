import { supabase } from "../db/index.js";
import { getVectorStore } from "../vector-storage/index.js";
import { createSplitter } from "../chunking-engine/index.js";

/**
 * List all document rows (id, content, metadata — no embeddings).
 * @returns {Promise<Array>}
 */
export async function listDocuments() {
  const { data, error } = await supabase
    .from("documents")
    .select("id, content, metadata")
    .order("id", { ascending: false });

  if (error) {
    throw Object.assign(new Error(error.message), { status: 502 });
  }
  return data;
}

/**
 * Chunk text, embed each chunk, and insert into the vector store.
 * @param {string} text
 * @param {Record<string, unknown>} metadata
 * @returns {Promise<{ inserted: number }>}
 */
export async function ingestDocument(text, metadata = {}) {
  const splitter = createSplitter();
  const docs = await splitter.createDocuments([text], [metadata]);
  await getVectorStore().addDocuments(docs);
  return { inserted: docs.length };
}

/**
 * Delete a single document row by ID.
 * @param {string} id
 */
export async function deleteDocument(id) {
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) {
    throw Object.assign(new Error(error.message), { status: 502 });
  }
}
