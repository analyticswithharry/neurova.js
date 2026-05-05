import type { Matrix, Vector } from './base'

/** Lloyd's k-means. Mirrors `nalyst.clustering.kmeans` and `neurova.ml.KMeans`. */
export class KMeans {
  k: number
  maxIter: number
  seed: number
  centroids: Matrix = []
  labels: Vector = []

  constructor(opts: { k?: number; maxIter?: number; seed?: number } = {}) {
    this.k = opts.k ?? 8
    this.maxIter = opts.maxIter ?? 100
    this.seed = opts.seed ?? 1
  }

  train(X: Matrix): this {
    const rng = mulberry32(this.seed)
    // k-means++ init.
    const n = X.length, d = X[0]!.length
    const idx0 = Math.floor(rng() * n)
    this.centroids = [X[idx0]!.slice()]
    while (this.centroids.length < this.k) {
      const dists = X.map((x) => Math.min(...this.centroids.map((c) => sqDist(x, c))))
      const sum = dists.reduce((a, b) => a + b, 0)
      let r = rng() * sum, pick = 0
      for (let i = 0; i < n; i++) { r -= dists[i]!; if (r <= 0) { pick = i; break } }
      this.centroids.push(X[pick]!.slice())
    }
    this.labels = new Array(n).fill(0)
    for (let it = 0; it < this.maxIter; it++) {
      let changed = false
      for (let i = 0; i < n; i++) {
        let best = 0, bestD = Infinity
        for (let c = 0; c < this.k; c++) {
          const dd = sqDist(X[i]!, this.centroids[c]!)
          if (dd < bestD) { bestD = dd; best = c }
        }
        if (this.labels[i] !== best) { this.labels[i] = best; changed = true }
      }
      const sums: Matrix = Array.from({ length: this.k }, () => new Array(d).fill(0))
      const counts = new Array(this.k).fill(0)
      for (let i = 0; i < n; i++) {
        const c = this.labels[i]!
        counts[c]++
        for (let j = 0; j < d; j++) sums[c]![j]! += X[i]![j]!
      }
      for (let c = 0; c < this.k; c++) {
        if (counts[c] > 0) for (let j = 0; j < d; j++) this.centroids[c]![j] = sums[c]![j]! / counts[c]
      }
      if (!changed) break
    }
    return this
  }

  infer(X: Matrix): Vector {
    return X.map((x) => {
      let best = 0, bestD = Infinity
      for (let c = 0; c < this.k; c++) {
        const dd = sqDist(x, this.centroids[c]!)
        if (dd < bestD) { bestD = dd; best = c }
      }
      return best
    })
  }
}

function sqDist(a: Vector, b: Vector): number {
  let s = 0
  for (let i = 0; i < a.length; i++) { const d = a[i]! - b[i]!; s += d * d }
  return s
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
