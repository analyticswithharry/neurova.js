import type { Matrix, Vector } from './base'

/**
 * Train/test split with optional shuffling. Mirrors
 * `nalyst.evaluation.train_test_split`.
 */
export function trainTestSplit(
  X: Matrix,
  y: Vector,
  opts: { testRatio?: number; seed?: number; shuffle?: boolean } = {},
): { Xtrain: Matrix; Xtest: Matrix; ytrain: Vector; ytest: Vector } {
  const testRatio = opts.testRatio ?? 0.2
  const shuffle = opts.shuffle ?? true
  const seed = opts.seed ?? 1
  const n = X.length
  const indices = Array.from({ length: n }, (_, i) => i)
  if (shuffle) {
    const rng = mulberry32(seed)
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1))
      ;[indices[i], indices[j]] = [indices[j]!, indices[i]!]
    }
  }
  const cutoff = Math.floor(n * (1 - testRatio))
  const train = indices.slice(0, cutoff)
  const test = indices.slice(cutoff)
  return {
    Xtrain: train.map((i) => X[i]!),
    Xtest: test.map((i) => X[i]!),
    ytrain: train.map((i) => y[i]!),
    ytest: test.map((i) => y[i]!),
  }
}

export function accuracyScore(yTrue: Vector, yPred: Vector): number {
  if (yTrue.length !== yPred.length) throw new Error('length mismatch')
  let hits = 0
  for (let i = 0; i < yTrue.length; i++) if (yTrue[i] === yPred[i]) hits++
  return hits / yTrue.length
}

export function meanSquaredError(yTrue: Vector, yPred: Vector): number {
  let s = 0
  for (let i = 0; i < yTrue.length; i++) { const d = yTrue[i]! - yPred[i]!; s += d * d }
  return s / yTrue.length
}

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
