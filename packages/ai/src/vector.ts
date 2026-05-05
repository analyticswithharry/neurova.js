import { id } from '@neurova/core'
import { cosineSimilarity } from './embed'

export interface VectorRecord<M = Record<string, unknown>> {
  id: string
  vector: number[]
  metadata?: M
  text?: string
}

export interface VectorQuery {
  vector: number[]
  topK?: number
  /** Optional metadata filter — receives the record metadata, returns true to keep. */
  filter?: (metadata: Record<string, unknown> | undefined) => boolean
}

export interface VectorMatch<M = Record<string, unknown>> {
  id: string
  score: number
  metadata?: M
  text?: string
}

export interface VectorStore<M = Record<string, unknown>> {
  upsert(records: VectorRecord<M>[]): Promise<void>
  query(q: VectorQuery): Promise<VectorMatch<M>[]>
  delete(ids: string[]): Promise<void>
  size(): Promise<number>
}

/**
 * In-memory vector store using cosine similarity. Excellent for tests, demos,
 * and small RAG indices. Swap in Qdrant / pgvector for production.
 */
export function createMemoryVectorStore<M = Record<string, unknown>>(): VectorStore<M> {
  const data = new Map<string, VectorRecord<M>>()
  return {
    async upsert(records) {
      for (const r of records) data.set(r.id ?? id('vec'), r)
    },
    async query({ vector, topK = 10, filter }) {
      const out: VectorMatch<M>[] = []
      for (const r of data.values()) {
        if (filter && !filter(r.metadata as Record<string, unknown> | undefined)) continue
        out.push({
          id: r.id,
          score: cosineSimilarity(vector, r.vector),
          metadata: r.metadata,
          text: r.text,
        })
      }
      out.sort((a, b) => b.score - a.score)
      return out.slice(0, topK)
    },
    async delete(ids) {
      for (const i of ids) data.delete(i)
    },
    async size() {
      return data.size
    },
  }
}
