import dotenv from "dotenv";

// Populate process.env before anything reads from it.
dotenv.config();

const required = ["OPENAI_API_KEY", "SUP_URL", "SUP_API_KEY", "API_KEY"];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`[config] Missing required env var: ${key}`);
  }
}

export const config = {
  port: Number(process.env.PORT) || 4000,

  apiKey: process.env.API_KEY,

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    chatModel: process.env.CHAT_MODEL || "gpt-4o-mini",
    embeddingModel: process.env.EMBEDDING_MODEL || "text-embedding-3-small",
    embeddingDim: Number(process.env.EMBEDDING_DIM) || 1536,
  },

  supabase: {
    url: process.env.SUP_URL,
    key: process.env.SUP_API_KEY,
    databaseUrl: process.env.DATABASE_URL,
  },

  retrieval: {
    topK: Number(process.env.RETRIEVAL_TOP_K) || 6,
    rrfK: Number(process.env.RRF_K) || 60,
    rerankWeightVector: Number(process.env.RERANK_WEIGHT_VECTOR) || 0.7,
    rerankWeightKeyword: Number(process.env.RERANK_WEIGHT_KEYWORD) || 0.3,
    rerankDiversityLambda: Number(process.env.RERANK_DIVERSITY_LAMBDA) || 0.85,
  },

  chunking: {
    chunkSize: Number(process.env.CHUNK_SIZE) || 1000,
    chunkOverlap: Number(process.env.CHUNK_OVERLAP) || 200,
  },

  session: {
    maxHistoryItems: 20,
  },
};
