import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import dotenv from "dotenv";

dotenv.config();

const openAIApiKey = process.env.OPENAI_API_KEY;
const sbAPIKey = process.env.SUP_API_KEY;
const supabaseURL = process.env.SUP_URL;

const embeddings = new OpenAIEmbeddings({ openAIApiKey });
const client = createClient(supabaseURL, sbAPIKey);

const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: "documents",
  queryName: "match_documents",
});

const retriever = vectorStore.asRetriever();

export { retriever };
