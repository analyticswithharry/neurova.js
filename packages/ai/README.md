# @neurova/ai

Provider-agnostic AI toolkit: chat, embeddings, vector store, RAG, agents, tracing.

```ts
import { chat, Agent, buildIndex, retrieve, answer, createMemoryVectorStore } from '@neurova/ai'
import { openAI, anthropic, ollama, echo } from '@neurova/ai/providers'

const provider = openAI({ apiKey: process.env.OPENAI_API_KEY! })

// 1. Chat
const r = await chat(provider, { messages: [{ role: 'user', content: 'hi' }] })

// 2. RAG
const store = createMemoryVectorStore()
await buildIndex([{ text: '...your docs...' }], { embedder: provider, store })
const a = await answer({ embedder: provider, store, chat: provider, query: 'what is neurova?' })

// 3. Agents (tool-calling)
const agent = new Agent({
  chat: provider,
  tools: [{
    name: 'add',
    description: 'add two numbers',
    parameters: { type: 'object', properties: { a: { type: 'number' }, b: { type: 'number' } }, required: ['a', 'b'] },
    execute: ({ a, b }: { a: number; b: number }) => a + b,
  }],
})
const result = await agent.run('what is 12 + 30?')
```

Built-in providers: `openAI` (also Azure / Together / Groq via `baseURL`), `anthropic`, `ollama`, `echo`.
