# Aurora RAG Chatbot

## Overview
This repo implements an Aurora-focused RAG chatbot:
- `back-end.js` chunks `aurora-info.txt`, embeds text, and stores vectors in Supabase.
- `server.js` runs a LangChain pipeline to rewrite questions, retrieve context, and answer.
- `public/` contains a lightweight chat UI that calls `/api/chat`.

## Stack
- Node.js (ES modules), Express
- LangChain (`@langchain/core`, `@langchain/openai`, `@langchain/community`, `@langchain/textsplitters`)
- OpenAI models (chat + embeddings)
- Supabase (Postgres + `pgvector`, `@supabase/supabase-js`)
- HTML/CSS/Vanilla JS

## How It Works
1. Load and chunk source text with `RecursiveCharacterTextSplitter`.
2. Embed chunks and store them in Supabase via the vector store.
3. Retrieve relevant chunks with `asRetriever()`.
4. Generate an answer from retrieved context using prompts + `StringOutputParser`.

## Definitions (Short)
- **Embeddings**: Numeric vectors representing text meaning for similarity search.
- **Vector store**: Database that stores embeddings and supports nearest-neighbor search.
- **Retriever**: Component that fetches relevant chunks for a query.
- **RAG**: Retrieval-Augmented Generation, where retrieved context guides the answer.
- **LCEL**: LangChain Expression Language for composing chains.

## Key Files
- `back-end.js`: data prep + ingestion
- `utils/retriever.js`: Supabase vector store + retriever
- `server.js`: RAG chain + API
- `public/index.html`, `public/index.js`: UI
- `match_doc.sql`: Supabase schema/function

## Review Notes (Short)
- `convHistory` is global and unbounded; consider per-user sessions.
- `/api/chat` has no validation or rate limiting.
- Re-running ingestion isn’t idempotent; add stable IDs or dedupe.
- Ensure `match_doc.sql` aligns with LangChain’s expected schema.

## Next Steps
- Add session-based memory
- Add input validation + rate limits
- Log/trace retrieval quality (e.g., LangSmith)
