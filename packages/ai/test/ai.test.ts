import { describe, expect, it } from 'vitest'
import { Agent, answer, buildIndex, chat, chatStream, chunkText, createMemoryVectorStore, retrieve } from '../src'
import { echo } from '../src/providers/echo'

describe('@neurova/ai', () => {
  it('echo chat round-trips text', async () => {
    const r = await chat(echo(), { messages: [{ role: 'user', content: 'hi' }] })
    expect(r.text).toBe('echo: hi')
  })

  it('echo stream yields characters', async () => {
    let out = ''
    for await (const c of chatStream(echo(), { messages: [{ role: 'user', content: 'ab' }] })) out += c
    expect(out).toBe('echo: ab')
  })

  it('chunks text', () => {
    const chunks = chunkText('a'.repeat(2000), { size: 800, overlap: 100 })
    expect(chunks.length).toBeGreaterThan(2)
  })

  it('builds an index and retrieves', async () => {
    const store = createMemoryVectorStore()
    const provider = echo()
    await buildIndex([{ text: 'neurova is a TypeScript library' }, { text: 'apples and oranges' }], {
      embedder: provider,
      store,
      size: 200,
    })
    const matches = await retrieve({ embedder: provider, store, query: 'neurova', topK: 2 })
    expect(matches.length).toBeGreaterThan(0)
    const result = await answer({ embedder: provider, store, chat: provider, query: 'what is neurova?' })
    expect(typeof result).toBe('string')
  })

  it('agent stops when no tool calls', async () => {
    const a = new Agent({ chat: echo(), tools: [] })
    const r = await a.run('hello')
    expect(r.output).toContain('echo')
  })
})
