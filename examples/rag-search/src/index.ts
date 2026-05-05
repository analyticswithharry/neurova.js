import { answer, buildIndex, createMemoryVectorStore } from '@neurova/ai'
import { echo } from '@neurova/ai/providers'

const provider = echo()
const store = createMemoryVectorStore()

await buildIndex(
  [
    {
      text: 'neurova is a TypeScript framework for AI-native apps. It includes UI, backend, and AI modules.',
    },
    { text: 'The vector store supports cosine similarity search and metadata filtering.' },
    { text: 'You can swap providers freely: openai, anthropic, ollama, or your own.' },
  ],
  { embedder: provider, store, size: 200 },
)

const result = await answer({
  embedder: provider,
  store,
  chat: provider,
  query: 'what is neurova?',
  topK: 3,
})

console.log('\nQuery: what is neurova?')
console.log('Answer:', result)
