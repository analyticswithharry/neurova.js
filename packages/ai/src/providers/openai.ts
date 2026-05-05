import { NeurovaError } from '@neurova/core'
import type { ChatProvider, ChatOptions, ChatResult, EmbedProvider, EmbedOptions, EmbedResult } from '../types'

export interface OpenAIConfig {
  apiKey: string
  baseURL?: string
  defaultModel?: string
  defaultEmbedModel?: string
  organization?: string
}

interface OpenAIChoice {
  message: { content: string | null; tool_calls?: { id: string; function: { name: string; arguments: string } }[] }
  finish_reason: string
}

/**
 * OpenAI-compatible chat + embeddings provider. Works with OpenAI, Azure
 * OpenAI (set baseURL), Together, Groq, etc — anything that mirrors the
 * `/v1/chat/completions` and `/v1/embeddings` shape.
 */
export function openAI(config: OpenAIConfig): ChatProvider & EmbedProvider {
  const baseURL = config.baseURL ?? 'https://api.openai.com/v1'
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${config.apiKey}`,
    ...(config.organization ? { 'OpenAI-Organization': config.organization } : {}),
  }

  const buildPayload = (opts: ChatOptions, stream: boolean) => ({
    model: opts.model ?? config.defaultModel ?? 'gpt-4o-mini',
    messages: opts.messages.map((m) => ({
      role: m.role,
      content: m.content,
      ...(m.toolCallId ? { tool_call_id: m.toolCallId } : {}),
      ...(m.name ? { name: m.name } : {}),
      ...(m.toolCalls
        ? {
            tool_calls: m.toolCalls.map((c) => ({
              id: c.id,
              type: 'function' as const,
              function: { name: c.name, arguments: JSON.stringify(c.arguments) },
            })),
          }
        : {}),
    })),
    temperature: opts.temperature,
    max_tokens: opts.maxTokens,
    stream,
    ...(opts.tools
      ? {
          tools: opts.tools.map((t) => ({
            type: 'function' as const,
            function: { name: t.name, description: t.description, parameters: t.parameters },
          })),
        }
      : {}),
  })

  return {
    name: 'openai',

    async chat(opts) {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(buildPayload(opts, false)),
        signal: opts.signal,
      })
      if (!res.ok) {
        throw new NeurovaError(`OpenAI chat failed: ${res.status}`, {
          code: 'NEUROVA_PROVIDER_ERROR',
          status: res.status,
          details: { body: await res.text() },
        })
      }
      const data = (await res.json()) as { choices: OpenAIChoice[]; usage?: { prompt_tokens?: number; completion_tokens?: number } }
      const choice = data.choices[0]
      if (!choice) throw new NeurovaError('OpenAI returned no choices', { code: 'NEUROVA_PROVIDER_ERROR' })
      const result: ChatResult = {
        text: choice.message.content ?? '',
        finishReason: choice.finish_reason as ChatResult['finishReason'],
        usage: { inputTokens: data.usage?.prompt_tokens, outputTokens: data.usage?.completion_tokens },
        raw: data,
      }
      if (choice.message.tool_calls?.length) {
        result.toolCalls = choice.message.tool_calls.map((c) => ({
          id: c.id,
          name: c.function.name,
          arguments: safeJSON(c.function.arguments),
        }))
      }
      return result
    },

    async *stream(opts) {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify(buildPayload(opts, true)),
        signal: opts.signal,
      })
      if (!res.ok || !res.body) {
        throw new NeurovaError(`OpenAI stream failed: ${res.status}`, {
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
          const trimmed = line.trim()
          if (!trimmed.startsWith('data:')) continue
          const payload = trimmed.slice(5).trim()
          if (payload === '[DONE]') return
          try {
            const json = JSON.parse(payload) as { choices: { delta: { content?: string } }[] }
            const delta = json.choices[0]?.delta.content
            if (delta) yield delta
          } catch {
            /* ignore malformed line */
          }
        }
      }
    },

    async embed(opts: EmbedOptions): Promise<EmbedResult> {
      const res = await fetch(`${baseURL}/embeddings`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: opts.model ?? config.defaultEmbedModel ?? 'text-embedding-3-small',
          input: opts.input,
        }),
        signal: opts.signal,
      })
      if (!res.ok) {
        throw new NeurovaError(`OpenAI embed failed: ${res.status}`, {
          code: 'NEUROVA_PROVIDER_ERROR',
          status: res.status,
          details: { body: await res.text() },
        })
      }
      const data = (await res.json()) as { data: { embedding: number[] }[]; usage?: { prompt_tokens?: number } }
      return {
        vectors: data.data.map((d) => d.embedding),
        usage: { inputTokens: data.usage?.prompt_tokens },
        raw: data,
      }
    },
  }
}

function safeJSON(s: string): Record<string, unknown> {
  try {
    return JSON.parse(s) as Record<string, unknown>
  } catch {
    return {}
  }
}
