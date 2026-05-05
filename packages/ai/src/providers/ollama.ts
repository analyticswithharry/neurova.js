import { NeurovaError } from '@neurova/core'
import type {
  ChatOptions,
  ChatProvider,
  ChatResult,
  EmbedOptions,
  EmbedProvider,
  EmbedResult,
} from '../types'

export interface OllamaConfig {
  baseURL?: string
  defaultModel?: string
  defaultEmbedModel?: string
}

/** Local inference provider for Ollama (https://ollama.com). No API key. */
export function ollama(config: OllamaConfig = {}): ChatProvider & EmbedProvider {
  const baseURL = config.baseURL ?? 'http://localhost:11434'

  return {
    name: 'ollama',

    async chat(opts: ChatOptions): Promise<ChatResult> {
      const res = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: opts.model ?? config.defaultModel ?? 'llama3.1',
          messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
          stream: false,
          options: { temperature: opts.temperature, num_predict: opts.maxTokens },
        }),
        signal: opts.signal,
      })
      if (!res.ok) {
        throw new NeurovaError(`Ollama chat failed: ${res.status}`, {
          code: 'NEUROVA_PROVIDER_ERROR',
          status: res.status,
        })
      }
      const data = (await res.json()) as { message: { content: string }; done_reason?: string }
      return {
        text: data.message.content,
        finishReason: (data.done_reason ?? 'stop') as ChatResult['finishReason'],
        raw: data,
      }
    },

    async *stream(opts) {
      const res = await fetch(`${baseURL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: opts.model ?? config.defaultModel ?? 'llama3.1',
          messages: opts.messages.map((m) => ({ role: m.role, content: m.content })),
          stream: true,
          options: { temperature: opts.temperature, num_predict: opts.maxTokens },
        }),
        signal: opts.signal,
      })
      if (!res.ok || !res.body) {
        throw new NeurovaError(`Ollama stream failed: ${res.status}`, {
          code: 'NEUROVA_PROVIDER_ERROR',
          status: res.status,
        })
      }
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''
        for (const line of lines) {
          if (!line.trim()) continue
          try {
            const json = JSON.parse(line) as { message?: { content?: string }; done?: boolean }
            const delta = json.message?.content
            if (delta) yield delta
            if (json.done) return
          } catch {
            /* ignore */
          }
        }
      }
    },

    async embed(opts: EmbedOptions): Promise<EmbedResult> {
      const inputs = Array.isArray(opts.input) ? opts.input : [opts.input]
      const vectors: number[][] = []
      for (const text of inputs) {
        const res = await fetch(`${baseURL}/api/embeddings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: opts.model ?? config.defaultEmbedModel ?? 'nomic-embed-text',
            prompt: text,
          }),
          signal: opts.signal,
        })
        if (!res.ok) {
          throw new NeurovaError(`Ollama embed failed: ${res.status}`, {
            code: 'NEUROVA_PROVIDER_ERROR',
            status: res.status,
          })
        }
        const data = (await res.json()) as { embedding: number[] }
        vectors.push(data.embedding)
      }
      return { vectors }
    },
  }
}
