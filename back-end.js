import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { OpenAIEmbeddings } from '@langchain/openai'
import {SupabaseVectorStore} from '@langchain/community/vectorstores/supabase'
import dotenv from 'dotenv'

dotenv.config()


try {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const text = await readFile(join(__dirname, 'aurora-info.txt'), 'utf8')

    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        separators: ['\n\n', '\n', ' ', ''],//default separators are ['\n\n', '\n', ' ', '']
        chunkOverlap: 50,
    });

    const output = await splitter.createDocuments([text])

    const sbAPIKey = process.env.SUP_API_KEY
    const supabaseURL = process.env.SUP_URL
    const openAIKey = process.env.OPENAI_API_KEY

    const supabaseClient = createClient(supabaseURL, sbAPIKey)

    await SupabaseVectorStore.fromDocuments(output, new OpenAIEmbeddings({openAIApiKey: openAIKey}), {
        client: supabaseClient,
        tableName: 'documents',
    })


    console.log(output)

} catch (err) {
  console.log(err)
}
