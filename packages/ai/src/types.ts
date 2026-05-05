/** Types and helpers shared across providers. */

export type Role = 'system' | 'user' | 'assistant' | 'tool'

export interface ChatMessage {
  role: Role
  content: string
  /** For tool messages: which tool call this is replying to. */
  toolCallId?: string
  /** For assistant messages: tool calls requested. */
  toolCalls?: ToolCall[]
  name?: string
}

export interface ToolCall {
  id: string
  name: string
  arguments: Record<string, unknown>
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown> // JSON schema
}

export interface ChatOptions {
  model?: string
  messages: ChatMessage[]
  temperature?: number
  maxTokens?: number
  tools?: ToolDefinition[]
  /** Abort signal forwarded to fetch. */
  signal?: AbortSignal
}

export interface ChatResult {
  text: string
  toolCalls?: ToolCall[]
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'other'
  usage?: { inputTokens?: number; outputTokens?: number }
  raw?: unknown
}

export interface EmbedOptions {
  model?: string
  input: string | string[]
  signal?: AbortSignal
}

export interface EmbedResult {
  vectors: number[][]
  usage?: { inputTokens?: number }
  raw?: unknown
}

export interface ChatProvider {
  name: string
  chat(opts: ChatOptions): Promise<ChatResult>
  stream(opts: ChatOptions): AsyncIterable<string>
}

export interface EmbedProvider {
  name: string
  embed(opts: EmbedOptions): Promise<EmbedResult>
}
