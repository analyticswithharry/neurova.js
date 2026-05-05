import type { EmbedOptions, EmbedProvider, EmbedResult } from './types'
export type { EmbedOptions, EmbedResult, EmbedProvider } from './types'

export async function embed(provider: EmbedProvider, opts: EmbedOptions): Promise<EmbedResult> {
  return provider.embed(opts)
}

/** Cosine similarity between two equally-sized vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vector length mismatch')
  let dot = 0
  let na = 0
  let nb = 0
  for (let i = 0; i < a.length; i++) {
    const x = a[i]!
    const y = b[i]!
    dot += x * y
    na += x * x
    nb += y * y
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb)
  return denom === 0 ? 0 : dot / denom
}
