import type { ChatOptions, ChatProvider, ChatResult } from './types'
export type { ChatMessage, ChatOptions, ChatResult, ToolCall, ToolDefinition, ChatProvider, Role } from './types'

/**
 * Generic chat() — pass any ChatProvider implementation.
 *
 * @example
 * import { openAI } from '@neurova/ai/providers'
 * const result = await chat(openAI({ apiKey: '...' }), {
 *   messages: [{ role: 'user', content: 'hello' }],
 * })
 */
export async function chat(provider: ChatProvider, opts: ChatOptions): Promise<ChatResult> {
  return provider.chat(opts)
}

/** Streaming variant — returns an async iterable of text deltas. */
export function chatStream(provider: ChatProvider, opts: ChatOptions): AsyncIterable<string> {
  return provider.stream(opts)
}
