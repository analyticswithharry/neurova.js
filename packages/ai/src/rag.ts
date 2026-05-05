import { id } from '@neurova/core'
import type { ChatProvider, EmbedProvider } from './types'
import type { VectorMatch, VectorStore } from './vector'

export interface ChunkOptions {
  /** Target chunk size in characters. Default 800. */
  size?: number
  /** Overlap between adjacent chunks. Default 120. */
  overlap?: number
}

/** Naive but reliable text chunker. Splits by paragraph then by size with overlap. */
export function chunkText(text: string, opts: ChunkOptions = {}): string[] {
  const size = opts.size ?? 800
  const overlap = opts.overlap ?? 120
  const paragraphs = text
    .split(/\n{2,}/g)
    .map((s) => s.trim())
    .filter(Boolean)
  const chunks: string[] = []
  for (const p of paragraphs) {
    if (p.length <= size) {
      chunks.push(p)
      continue
    }
    let i = 0
    while (i < p.length) {
      chunks.push(p.slice(i, i + size))
      i += size - overlap
    }
  }
  return chunks
}

export interface RagDocument {
  id?: string
  text: string
  metadata?: Record<string, unknown>
}

export interface BuildIndexOptions extends ChunkOptions {
  embedder: EmbedProvider
  store: VectorStore
}

/** Chunk + embed + upsert. */
export async function buildIndex(docs: RagDocument[], opts: BuildIndexOptions): Promise<number> {
  const records: { id: string; text: string; metadata?: Record<string, unknown> }[] = []
  for (const d of docs) {
    const docId = d.id ?? id('doc')
    for (const chunk of chunkText(d.text, opts)) {
      records.push({ id: id('chk'), text: chunk, metadata: { ...d.metadata, docId } })
    }
  }
  // Embed in batches of 100 to be friendly to provider limits.
  for (let i = 0; i < records.length; i += 100) {
    const batch = records.slice(i, i + 100)
    const { vectors } = await opts.embedder.embed({ input: batch.map((b) => b.text) })
    await opts.store.upsert(
      batch.map((b, idx) => ({
        id: b.id,
        text: b.text,
        metadata: b.metadata,
        vector: vectors[idx]!,
      })),
    )
  }
  return records.length
}

export interface RetrieveOptions {
  embedder: EmbedProvider
  store: VectorStore
  query: string
  topK?: number
}

export async function retrieve(opts: RetrieveOptions): Promise<VectorMatch[]> {
  const { vectors } = await opts.embedder.embed({ input: opts.query })
  return opts.store.query({ vector: vectors[0]!, topK: opts.topK ?? 5 })
}

export interface AnswerOptions extends RetrieveOptions {
  chat: ChatProvider
  /** Override the system prompt template. Use {{context}} placeholder. */
  systemPrompt?: string
}

const DEFAULT_SYSTEM = `You are a careful assistant. Answer the user's question using ONLY the context below. If the answer is not in the context, say you do not know.

CONTEXT:
{{context}}`

/** End-to-end RAG: retrieve → format context → chat. */
export async function answer(opts: AnswerOptions): Promise<string> {
  const matches = await retrieve(opts)
  const context = matches.map((m, i) => `[${i + 1}] ${m.text ?? ''}`).join('\n\n')
  const system = (opts.systemPrompt ?? DEFAULT_SYSTEM).replace('{{context}}', context)
  const result = await opts.chat.chat({
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: opts.query },
    ],
  })
  return result.text
}
