export default function Page() {
  return (
    <article>
      <h1>@neurova/ai</h1>
      <p>Provider-agnostic AI runtime: chat, embeddings, vector search, RAG, and tool-using agents.</p>

      <h2>Providers</h2>
      <pre>{`import { openAI, anthropic, ollama, echo } from '@neurova/ai/providers'

const provider = openAI({ apiKey: process.env.OPENAI_API_KEY! })
// or anthropic({ apiKey: ... }) / ollama() / echo()`}</pre>

      <h2>Chat</h2>
      <pre>{`import { chat, chatStream } from '@neurova/ai'

const r = await chat(provider, { messages: [{ role: 'user', content: 'hi' }] })
for await (const delta of chatStream(provider, { messages })) process.stdout.write(delta)`}</pre>

      <h2>Embeddings</h2>
      <pre>{`import { embed, cosineSimilarity } from '@neurova/ai'

const { vectors } = await embed(provider, { input: ['cat', 'dog'] })
const sim = cosineSimilarity(vectors[0], vectors[1])`}</pre>

      <h2>Vector store</h2>
      <pre>{`import { createMemoryVectorStore } from '@neurova/ai'

const store = createMemoryVectorStore()
await store.upsert([{ id: '1', vector, metadata: { title: 'foo' } }])
const matches = await store.query({ vector: queryVec, topK: 5 })`}</pre>

      <h2>RAG</h2>
      <pre>{`import { buildIndex, answer } from '@neurova/ai'

await buildIndex(docs, { embedder: provider, store })
const reply = await answer({ embedder: provider, store, chat: provider, query: 'what is X?' })`}</pre>

      <h2>Agents</h2>
      <pre>{`import { Agent } from '@neurova/ai'

const agent = new Agent({
  provider,
  systemPrompt: 'You are helpful.',
  tools: [{
    name: 'getTime',
    description: 'Get the current ISO timestamp',
    parameters: { type: 'object', properties: {} },
    execute: async () => new Date().toISOString(),
  }],
})

const run = await agent.run('What time is it?')
console.log(run.output)`}</pre>
    </article>
  )
}
