import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { config } from "../config/index.js";
import { getRetriever } from "../retrieval/index.js";

// Per-session history: Map<sessionId, string[]>
// Flat array [q1, a1, q2, a2, ...] capped at config.session.maxHistoryItems.
const sessions = new Map();

function getHistory(sessionId) {
  if (!sessions.has(sessionId)) sessions.set(sessionId, []);
  return sessions.get(sessionId);
}

function formatHistory(history) {
  return history
    .map((msg, i) => (i % 2 === 0 ? `User: ${msg}` : `Bot: ${msg}`))
    .join("\n");
}

function combineDocuments(docs) {
  return docs.map((d) => d.pageContent).join("\n\n");
}

const llm = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: config.openai.apiKey,
  modelName: config.openai.chatModel,
});

const standalonePrompt = PromptTemplate.fromTemplate(
  `Given a conversation history and a question, convert it to a standalone question.
conversation history: {conv_history}
question: {question}
standalone question:`
);

const answerPrompt = PromptTemplate.fromTemplate(
  `You are a helpful and enthusiastic support bot who can answer a given question about Aurora based on the context provided. Try to find the answer in the context. If you really don't know the answer, say "I'm sorry, I don't know the answer to that." Don't try to make up an answer. Always speak as if you were chatting to a friend.
context: {context}
conversation history: {conv_history}
question: {question}
answer:`
);

const standaloneChain = standalonePrompt.pipe(llm).pipe(new StringOutputParser());

const retrieverChain = RunnableSequence.from([
  (prev) => prev.standalone_question,
  getRetriever(),
  combineDocuments,
]);

const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

const ragChain = RunnableSequence.from([
  {
    question: (input) => input.question,
    standalone_question: standaloneChain,
    conv_history: (input) => input.conv_history,
  },
  {
    context: retrieverChain,
    question: ({ question }) => question,
    conv_history: ({ conv_history }) => conv_history,
  },
  answerChain,
]);

/**
 * Run the full RAG pipeline for a given question and session.
 * @param {{ question: string, sessionId: string }} params
 * @returns {Promise<string>}
 */
export async function chat({ question, sessionId }) {
  const history = getHistory(sessionId);
  const conv_history = formatHistory(history);

  const answer = await ragChain.invoke({ question, conv_history });

  history.push(question, answer);
  if (history.length > config.session.maxHistoryItems) {
    history.splice(0, history.length - config.session.maxHistoryItems);
  }

  return answer;
}
