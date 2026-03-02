import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { OpenAIEmbeddings } from '@langchain/openai'
import {SupabaseVectorStore} from '@langchain/community/vectorstores/supabase'
import dotenv from 'dotenv'

// Load environment variables from .env for local dev.
dotenv.config()


try {
  // Resolve path to the local data file when running as an ES module.
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const text = await readFile(join(__dirname, 'aurora-info.txt'), 'utf8')

    // Split the source text into overlapping chunks for retrieval.
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        separators: ['\n\n', '\n', ' ', ''],//default separators are ['\n\n', '\n', ' ', '']
        chunkOverlap: 50,
    });

    const output = await splitter.createDocuments([text])

    // Load credentials from the environment.
    const sbAPIKey = process.env.SUP_API_KEY
    const supabaseURL = process.env.SUP_URL
    const openAIKey = process.env.OPENAI_API_KEY

    // Create Supabase client and push embeddings into the vector store.
    const supabaseClient = createClient(supabaseURL, sbAPIKey)

    await SupabaseVectorStore.fromDocuments(output, new OpenAIEmbeddings({openAIApiKey: openAIKey}), {
        client: supabaseClient,
        tableName: 'documents',
    })


    console.log(output)

} catch (err) {
  console.log(err)
}
