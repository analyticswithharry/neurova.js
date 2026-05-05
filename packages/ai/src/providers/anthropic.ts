import { NeurovaError } from '@neurova/core'
import type { ChatOptions, ChatProvider, ChatResult } from '../types'

export interface AnthropicConfig {
  apiKey: string
  baseURL?: string
  defaultModel?: string
  version?: string
}

/** Anthropic Messages API provider (chat + streaming). */
export function anthropic(config: AnthropicConfig): ChatProvider {
  const baseURL = config.baseURL ?? 'https://api.anthropic.com/v1'
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': config.apiKey,
    'anthropic-version': config.version ?? '2023-06-01',
  }

  const buildPayload = (opts: ChatOptions, stream: boolean) => {
    const system = opts.messages.find((m) => m.role === 'system')?.content
    const messages = opts.messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    return {
      model: opts.model ?? config.defaultModel ?? 'claude-3-5-sonnet-latest',
      system,
      messages,
      max_tokens: opts.maxTokens ?? 1024,
      temperature: opts.temperature,
      stream,
      ...(opts.tools
        ? {
            tools: opts.tools.map((t) => ({
              name: t.name,
              description: t.description,
              input_schema: t.parameters,
            })),
          }
        : {}),
    }
  }

  return {
    name: 'anthropic',

    async chat(opts) {
      const res = await fetch(`${baseURL}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(buildPayload(opts, false)),
        signal: opts.signal,
      })
      if (!res.ok) {
        throw new NeurovaError(`Anthropic chat failed: ${res.status}`, {
          code: 'NEUROVA_PROVIDER_ERROR',
          status: res.status,
          details: { body: await res.text() },
        })
      }
      const data = (await res.json()) as {
        content: {
          type: string
          text?: string
          id?: string
          name?: string
          input?: Record<string, unknown>
        }[]
        stop_reason?: string
        usage?: { input_tokens?: number; output_tokens?: number }
      }
      const text = data.content
        .filter((c) => c.type === 'text')
        .map((c) => c.text ?? '')
        .join('')
      const toolUses = data.content.filter((c) => c.type === 'tool_use')
      const result: ChatResult = {
        text,
        finishReason: (data.stop_reason ?? 'stop') as ChatResult['finishReason'],
        usage: { inputTokens: data.usage?.input_tokens, outputTokens: data.usage?.output_tokens },
        raw: data,
      }
      if (toolUses.length > 0) {
        result.toolCalls = toolUses.map((t) => ({
          id: t.id ?? '',
          name: t.name ?? '',
          arguments: t.input ?? {},
        }))
      }
      return result
    },

    async *stream(opts) {
      const res = await fetch(`${baseURL}/messages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(buildPayload(opts, true)),
        signal: opts.signal,
      })
      if (!res.ok || !res.body) {
        throw new NeurovaError(`Anthropic stream failed: ${res.status}`, {
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
          if (!payload) continue
          try {
            const json = JSON.parse(payload) as {
              type: string
              delta?: { type?: string; text?: string }
            }
            if (
              json.type === 'content_block_delta' &&
              json.delta?.type === 'text_delta' &&
              json.delta.text
            ) {
              yield json.delta.text
            }
          } catch {
            /* ignore */
          }
        }
      }
    },
  }
}
