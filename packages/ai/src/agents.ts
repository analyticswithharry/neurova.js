import { NeurovaError } from '@neurova/core'
import type { ChatMessage, ChatProvider, ToolCall, ToolDefinition } from './types'

export interface AgentTool<I = Record<string, unknown>, O = unknown> {
  name: string
  description: string
  /** JSON schema describing the tool input. */
  parameters: Record<string, unknown>
  execute: (input: I) => Promise<O> | O
}

export interface AgentOptions {
  chat: ChatProvider
  model?: string
  systemPrompt?: string
  tools: AgentTool[]
  /** Hard cap on tool-calling rounds. Default 8. */
  maxIterations?: number
}

export interface AgentRun {
  messages: ChatMessage[]
  output: string
  toolCalls: { name: string; input: unknown; output: unknown }[]
}

/**
 * Lightweight tool-calling agent loop. The provider is expected to return
 * `toolCalls` on the result when a tool should be invoked. We execute each
 * tool, append the result as a `tool` message, and loop until the model
 * stops requesting tools or `maxIterations` is reached.
 */
export class Agent {
  constructor(private readonly opts: AgentOptions) {}

  get tools(): ToolDefinition[] {
    return this.opts.tools.map((t) => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }))
  }

  async run(input: string): Promise<AgentRun> {
    const max = this.opts.maxIterations ?? 8
    const messages: ChatMessage[] = []
    if (this.opts.systemPrompt) messages.push({ role: 'system', content: this.opts.systemPrompt })
    messages.push({ role: 'user', content: input })

    const trace: AgentRun['toolCalls'] = []

    for (let i = 0; i < max; i++) {
      const result = await this.opts.chat.chat({
        model: this.opts.model,
        messages,
        tools: this.tools,
      })
      messages.push({ role: 'assistant', content: result.text, toolCalls: result.toolCalls })
      const calls = result.toolCalls ?? []
      if (calls.length === 0) {
        return { messages, output: result.text, toolCalls: trace }
      }
      for (const call of calls) {
        const tool = this.opts.tools.find((t) => t.name === call.name)
        if (!tool) {
          messages.push({
            role: 'tool',
            toolCallId: call.id,
            content: JSON.stringify({ error: `Unknown tool ${call.name}` }),
          })
          continue
        }
        try {
          const output = await tool.execute(call.arguments as never)
          trace.push({ name: call.name, input: call.arguments, output })
          messages.push({
            role: 'tool',
            toolCallId: call.id,
            content: typeof output === 'string' ? output : JSON.stringify(output),
          })
        } catch (e) {
          messages.push({
            role: 'tool',
            toolCallId: call.id,
            content: JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
          })
        }
      }
    }
    throw new NeurovaError('Agent exceeded maxIterations', {
      code: 'NEUROVA_AGENT_LIMIT',
      details: { messages, trace },
    })
  }
}

export type { ToolCall, ToolDefinition }
