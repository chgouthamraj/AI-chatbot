# Project Review and Learning Summary

Date: 2026-03-01

## Scope note
I could not fetch the YouTube video directly, so this review is based on the code in this repo plus the public course outline for the official LangChain.js Scrimba chatbot course.

## What you built (based on this repo)
A Scrimba-focused RAG chatbot with:
- A data prep script that chunks a text file, embeds it, and stores it in Supabase. See `back-end.js`.
- A Node server that runs a LangChain pipeline to rewrite questions, retrieve context from Supabase, and answer in a friendly tone. See `server.js` and `utils/retriever.js`.
- A simple browser UI that posts user questions to the server and renders chat bubbles. See `public/index.html` and `public/index.js`.

## Tech stack and tools used
- Node.js (ES modules)
- LangChain (`@langchain/core`, `@langchain/openai`, `@langchain/community`, `@langchain/textsplitters`)
- OpenAI models (chat + embeddings)
- Supabase (Postgres + `pgvector`, `@supabase/supabase-js`)
- Express (API server + static hosting)
- HTML/CSS/Vanilla JS frontend
- dotenv for environment variables

## Topics you learned (inferred from the project and course outline)
The course outline for the LangChain.js Scrimba chatbot explicitly calls out vectorizing text chunks, embeddings, Supabase vector store, prompt templates, LCEL, `.pipe()`, retrieval, `RunnableSequence`, and `StringOutputParser`.

### Core definitions and why they matter
- **Embeddings**: OpenAI embeddings turn text into numeric vectors. Similar texts have closer vectors; distances reflect relatedness. Embeddings are commonly used for search, clustering, recommendations, classification, and more.
- **Vector store + pgvector**: A Supabase Postgres database with the `pgvector` extension stores vectors and enables similarity search. LangChain’s Supabase integration expects a `documents` table and a `match_documents` function.
- **Retriever**: LangChain’s Supabase vector store can be turned into a retriever via `asRetriever()` and then invoked in chains.
- **RunnableSequence**: A composition primitive that chains runnables sequentially, passing the output of one into the next.
- **LCEL**: LangChain Expression Language composes runnables declaratively, often via `.pipe()` or `RunnableSequence`.
- **RunnablePassthrough.assign**: Adds new keys to chain state while preserving the existing input, useful for passing context and original question together.
- **Express server basics**: `express.json()` parses JSON bodies, `app.post()` handles POST routes, `express.static()` serves static files, and `app.listen()` starts the server.
- **dotenv**: Loads environment variables from a `.env` file into `process.env`.
- **Supabase JS client**: `createClient` initializes a Supabase client with project URL and key.

## Step-by-step process (how the app works)
1. **Prepare data**: `scrimba-info.txt` is loaded and chunked using `RecursiveCharacterTextSplitter`. See `back-end.js`.
2. **Embed and store**: Each chunk is embedded with OpenAI embeddings and stored in Supabase using the LangChain Supabase vector store. See `back-end.js`. This requires a `documents` table and `match_documents` function, plus `pgvector` enabled.
3. **Initialize retriever**: `utils/retriever.js` creates a Supabase client and exposes `vectorStore.asRetriever()` for similarity search.
4. **Build the chain**: `server.js` creates a `RunnableSequence` with:
   - A standalone-question prompt
   - Retrieval of context from Supabase
   - An answer prompt + model + `StringOutputParser`
   See `server.js`.
5. **Serve UI**: Express serves `public/index.html` and `public/index.js` as static files, and exposes `/api/chat`.
6. **Chat loop**: Browser JS posts the user question to `/api/chat`; the server runs the chain and returns an answer; UI renders both messages. See `public/index.js`.

## Sample syntax you used (from the project)
- Prompt templates:
```js
const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);
```
- Runnable sequences:
```js
const chain = RunnableSequence.from([
  { question: (input) => input.question, standalone_question: standaloneQuestionChain },
  { context: retrieverChain, question: ({ question }) => question },
  answerChain,
]);
```
- Supabase vector store (retriever):
```js
const vectorStore = new SupabaseVectorStore(embeddings, {
  client,
  tableName: "documents",
  queryName: "match_documents",
});
const retriever = vectorStore.asRetriever();
```

## Review findings (ordered by severity)
1. **Security risk: serving the repo root**
   This has been addressed by serving `public/` instead of the repo root. File: `server.js`.
2. **Global in-memory conversation history**
   `convHistory` is a single array shared by all users and never cleared. This mixes user conversations and grows without bound. File: `server.js`.
3. **Schema mismatch risk with Supabase SQL**
   Your `match_doc.sql` uses `id uuid` and returns only `id`, `content`, `metadata`, `similarity`. The LangChain SupabaseVectorStore docs show a `bigserial` id and include `embedding` in the returned table. If your runtime expects the doc shape from the official integration, you may see subtle errors or missing fields. File: `match_doc.sql`.
4. **No validation or rate limiting on `/api/chat`**
   Any client can post huge inputs repeatedly. Add input length checks and rate limits to avoid cost spikes. File: `server.js`.
5. **Data prep is single-run and not idempotent**
   `back-end.js` always loads and writes all docs; you can accidentally duplicate or overwrite without clear IDs. Add deterministic IDs or de-duplication if you rerun. File: `back-end.js`.

## What else would be useful to learn next
1. **RAG evaluation and tracing**: Add LangSmith or logging to inspect retrieval quality and response correctness. The SupabaseVectorStore docs mention LangSmith as an optional step.
2. **Chunking strategies**: Experiment with different chunk sizes and overlaps to improve recall and reduce hallucinations.
3. **Session-based memory**: Track conversations per user (cookie, session ID, or local storage) instead of global arrays.
4. **Production hardening**: Add CORS, input validation, error handling, and secrets management beyond `.env`.

---
If you want, I can also produce a cleaned-up README that includes run instructions, environment variables, and architecture diagrams.
