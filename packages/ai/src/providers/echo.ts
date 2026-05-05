import type { ChatProvider, EmbedProvider } from '../types'

/**
 * Deterministic, no-network provider used for tests, examples, and offline
 * demos. Echoes the last user message and produces stable hash-based vectors.
 */
export function echo(): ChatProvider & EmbedProvider {
  return {
    name: 'echo',

    async chat({ messages }) {
      const last = [...messages].reverse().find((m) => m.role === 'user')
      const text = last ? `echo: ${last.content}` : 'echo: (no input)'
      return { text, finishReason: 'stop' }
    },

    async *stream({ messages }) {
      const last = [...messages].reverse().find((m) => m.role === 'user')
      const text = last ? `echo: ${last.content}` : 'echo: (no input)'
      for (const ch of text) yield ch
    },

    async embed({ input }) {
      const inputs = Array.isArray(input) ? input : [input]
      return { vectors: inputs.map((s) => hashVector(s, 64)) }
    },
  }
}

function hashVector(text: string, dim: number): number[] {
  const v = new Array<number>(dim).fill(0)
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i)
    v[code % dim]! += 1
  }
  // L2 normalize
  let norm = 0
  for (const x of v) norm += x * x
  norm = Math.sqrt(norm) || 1
  return v.map((x) => x / norm)
}
