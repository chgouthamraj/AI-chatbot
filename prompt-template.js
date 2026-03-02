import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";
import dotenv from 'dotenv'

dotenv.config() 

const llm = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const tweetTemplate = 'Generate a promotional tweet for a product, from this product description: {productDesc}'

const tweetPrompt =  PromptTemplate.fromTemplate(tweetTemplate)

//console.log(tweetPrompt)

const tweetChain = tweetPrompt.pipe(llm)

//console.log(tweetChain)

const response = await tweetChain.invoke({
  productDesc: 'Electric shoes'
})

console.log(response)
