import { id } from '@neurova/core'

export interface Span {
  id: string
  name: string
  startTime: number
  endTime?: number
  attributes: Record<string, unknown>
  children: Span[]
}

export interface Tracer {
  span<T>(name: string, fn: (span: Span) => Promise<T> | T, attributes?: Record<string, unknown>): Promise<T>
  current(): Span | null
  export(): Span[]
}

/**
 * Tiny in-process tracer compatible with OTel attribute conventions for LLM
 * calls (gen_ai.* attributes). Exports a tree of spans that you can ship to
 * any backend.
 */
export function createTracer(): Tracer {
  const roots: Span[] = []
  const stack: Span[] = []
  const current = () => stack[stack.length - 1] ?? null

  return {
    current,
    async span(name, fn, attributes = {}) {
      const span: Span = {
        id: id('span'),
        name,
        startTime: Date.now(),
        attributes: { ...attributes },
        children: [],
      }
      const parent = current()
      if (parent) parent.children.push(span)
      else roots.push(span)
      stack.push(span)
      try {
        return await fn(span)
      } finally {
        span.endTime = Date.now()
        stack.pop()
      }
    },
    export() {
      return roots
    },
  }
}

export const noopTracer: Tracer = {
  current: () => null,
  async span(_, fn) {
    return fn({ id: '', name: '', startTime: 0, attributes: {}, children: [] })
  },
  export: () => [],
}
