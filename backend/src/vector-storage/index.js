import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { supabase } from "../db/index.js";
import { getEmbeddings } from "../embedding-service/index.js";

let _vectorStore;

/**
 * Returns the shared SupabaseVectorStore instance (lazy singleton).
 * tableName and queryName must match the schema in match_doc.sql.
 * @returns {SupabaseVectorStore}
 */
export function getVectorStore() {
  if (!_vectorStore) {
    _vectorStore = new SupabaseVectorStore(getEmbeddings(), {
      client: supabase,
      tableName: "documents",
      queryName: "match_documents",
    });
  }
  return _vectorStore;
}
