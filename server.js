import express from "express";
import dotenv from "dotenv";
import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { retriever } from "./utils/retriever.js";
import { formatCobHistory } from "./utils/formatCobHistory.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

const requiredEnv = ["OPENAI_API_KEY", "SUP_API_KEY", "SUP_URL"];
for (const key of requiredEnv) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

const llm = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const standaloneQuestionTemplate =
  "Given a conversation history and a question, convert it to a standalone question:\nconversation history: {conv_history}\nquestion: {question}\nstandalone question:";
const standaloneQuestionPrompt = PromptTemplate.fromTemplate(
  standaloneQuestionTemplate
);

const answerTemplate = `You are a helpful and enthusiastic support bot who can answer a given
question about Aurora based on the context provided. Try to find the answer in the context. If you
really don't know the answer, say "I'm sorry, I don't know the answer to that." And direct the
questioner to email help@aurora.example. Don't try to make up an answer. Always speak as if you were
chatting to a friend.
context: {context}
conversation history: {conv_history}
question: {question}
answer:
`;

const answerPrompt = PromptTemplate.fromTemplate(answerTemplate);

function combineDocuments(docs) {
  return docs.map((doc) => doc.pageContent).join("\n\n");
}

const standaloneQuestionChain = standaloneQuestionPrompt
  .pipe(llm)
  .pipe(new StringOutputParser());

const retrieverChain = RunnableSequence.from([
  (prevResult) => prevResult.standalone_question,
  retriever,
  combineDocuments,
]);

const answerChain = answerPrompt.pipe(llm).pipe(new StringOutputParser());

const chain = RunnableSequence.from([
  {
    question: (input) => input.question,
    standalone_question: standaloneQuestionChain,
    conv_history: (input) => input.conv_history,
  },
  {
    context: retrieverChain,
    question: ({ question }) => question,
    conv_history: ({ conv_history }) => conv_history,
  },
  answerChain,
]);

const convHistory = [];
const maxHistoryItems = 20;


app.post("/api/chat", async (req, res) => {
  try {
    const question = req.body?.question?.trim();
    if (!question) {
      return res.status(400).json({ error: "Question is required." });
    }
    if (question.length > 500) {
      return res.status(413).json({ error: "Question is too long." });
    }
    const conv_history = formatCobHistory(convHistory);
    const answer = await chain.invoke({ question, conv_history });

    convHistory.push(question);
    convHistory.push(answer);
    if (convHistory.length > maxHistoryItems) {
      convHistory.splice(0, convHistory.length - maxHistoryItems);
    }

    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error." });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
