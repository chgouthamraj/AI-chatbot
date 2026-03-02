import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import dotenv from 'dotenv'

// Load environment variables from .env for local dev.
dotenv.config() 

// Simple model instance for a single prompt.
const llm = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// Prompt template for a short marketing tweet.
const tweetTemplate = 'Generate a promotional tweet for a product, from this product description: {productDesc}'

const tweetPrompt =  PromptTemplate.fromTemplate(tweetTemplate)

//console.log(tweetPrompt)

// Pipe the prompt into the model.
const tweetChain = tweetPrompt.pipe(llm)

//console.log(tweetChain)

// Sample invocation.
const response = await tweetChain.invoke({
  productDesc: 'Electric shoes'
})

console.log(response)
