import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import dotenv from "dotenv";

// Load environment variables from .env for local dev.
dotenv.config();

// Shared model for each step in the sequence.
const llm = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
});

// Step 1: add missing punctuation.
const punctuationTemplate = `Given a sentence, add punctuation where needed.
  sentence: {sentence}
  sentence with punctuation:`;

const punctuationPrompt = PromptTemplate.fromTemplate(punctuationTemplate);

// Step 2: fix grammar.
const grammarTemplate = `Given a sentence correct the grammar.
  sentence: {punctuated_sentence}
  sentence with correct grammar:`;

const grammarPrompt = PromptTemplate.fromTemplate(grammarTemplate);

// const chain = RunnableSequence.from([
//   punctuationPrompt,
//   llm,
//   new StringOutputParser(),
//   (punctuated_sentence) => ({ punctuated_sentence }),
//   grammarPrompt,
//   llm,
//   new StringOutputParser(),
// ]);

// Step 3: translate into the requested language.
const translationTemplate = `Given a sentence, translate that sentence into {language}
  sentence: {grammatically_correct_sentence}
  translated sentence:`;

const translationPrompt = PromptTemplate.fromTemplate(translationTemplate);

const punctuationChain = RunnableSequence.from([
    punctuationPrompt,
    llm,
    new StringOutputParser(),
]);
const grammarChain = RunnableSequence.from([
    grammarPrompt,
    llm,
    new StringOutputParser(),
]);
const translationChain = RunnableSequence.from([
    translationPrompt,
    llm,
    new StringOutputParser(),
]);


// Build a pipeline that punctuates -> fixes grammar -> translates.
const chain = RunnableSequence.from([{
    punctuated_sentence: punctuationChain,
    original_sentence: new RunnablePassthrough()
},
{
    grammatically_correct_sentence: grammarChain,
    language: ({ original_sentence }) => original_sentence.language
},
    translationChain
])


// Sample invocation.
const response = await chain.invoke({
    sentence: "i dont liked mondays",
    language: "hindi",
});

console.log(response);
