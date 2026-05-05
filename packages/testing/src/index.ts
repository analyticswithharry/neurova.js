import type {
  ChatOptions,
  ChatProvider,
  ChatResult,
  EmbedOptions,
  EmbedProvider,
  EmbedResult,
} from '@neurova/ai'

export interface MockChatOptions {
  /** Sequence of replies to return in order. After exhausting, repeats last. */
  replies?: (string | ChatResult)[]
}

/**
 * Mock chat provider for tests. Records every call and returns scripted
 * replies. Both `chat` and `stream` are supported.
 */
export function mockChat(opts: MockChatOptions = {}): ChatProvider & { calls: ChatOptions[] } {
  const replies = opts.replies && opts.replies.length > 0 ? opts.replies : ['ok']
  const calls: ChatOptions[] = []
  let i = 0
  const next = (): ChatResult => {
    const r = replies[Math.min(i, replies.length - 1)]!
    i++
    return typeof r === 'string' ? { text: r, finishReason: 'stop' } : r
  }
  return {
    name: 'mock-chat',
    calls,
    async chat(options) {
      calls.push(options)
      return next()
    },
    async *stream(options) {
      calls.push(options)
      const result = next()
      for (const ch of result.text) yield ch
    },
  }
}

export interface MockEmbedOptions {
  /** Vector dimension for generated embeddings. Default 32. */
  dim?: number
}

export function mockEmbed(opts: MockEmbedOptions = {}): EmbedProvider & { calls: EmbedOptions[] } {
  const dim = opts.dim ?? 32
  const calls: EmbedOptions[] = []
  return {
    name: 'mock-embed',
    calls,
    async embed(options) {
      calls.push(options)
      const inputs = Array.isArray(options.input) ? options.input : [options.input]
      const vectors = inputs.map((s) => {
        const v = new Array<number>(dim).fill(0)
        for (let j = 0; j < s.length; j++) v[j % dim]! += s.charCodeAt(j) / 1000
        return v
      })
      return { vectors } as EmbedResult
    },
  }
}

/** Drain an AsyncIterable<string> into a single string. Useful in tests. */
export async function collectStream(iter: AsyncIterable<string>): Promise<string> {
  let out = ''
  for await (const c of iter) out += c
  return out
}
