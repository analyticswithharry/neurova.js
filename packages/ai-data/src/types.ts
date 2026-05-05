/**
 * Common dataset shape — mirrors the dictionary returned by
 * `neurova.datasets.load_*` in Python.
 */
export interface Dataset {
  /** Flat float feature matrix, row-major, shape [nSamples, nFeatures]. */
  data: Float32Array
  /** Integer or float target vector, length nSamples. */
  target: Float32Array
  /** Number of samples. */
  nSamples: number
  /** Number of features per sample. */
  nFeatures: number
  /** Feature column names. */
  featureNames: string[]
  /** Class label names (classification only). */
  targetNames?: string[]
  /** Free-form description. */
  description: string
}

/** Get row `i` as a plain number array (length nFeatures). */
export function row(d: Dataset, i: number): number[] {
  const out = new Array<number>(d.nFeatures)
  const off = i * d.nFeatures
  for (let k = 0; k < d.nFeatures; k++) out[k] = d.data[off + k]!
  return out
}

/** Convert flat features to a 2-D number[][] matrix (matches @neurova/ai-ml `Matrix`). */
export function asMatrix(d: Dataset): number[][] {
  const out: number[][] = []
  for (let i = 0; i < d.nSamples; i++) out.push(row(d, i))
  return out
}
