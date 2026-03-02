import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence, RunnablePassthrough } from "@langchain/core/runnables";
import dotenv from "dotenv";

dotenv.config();

const llm = new ChatOpenAI({
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
});

const punctuationTemplate = `Given a sentence, add punctuation where needed.
  sentence: {sentence}
  sentence with punctuation:`;

const punctuationPrompt = PromptTemplate.fromTemplate(punctuationTemplate);

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


const response = await chain.invoke({
    sentence: "i dont liked mondays",
    language: "hindi",
});

console.log(response);
