import { BaseLearner, type Matrix, type Vector } from './base'

/** k-Nearest Neighbors classifier. Port of `nalyst.learners.neighbors.KNearestNeighbors`. */
export class KNearestNeighbors extends BaseLearner {
  k: number
  private X: Matrix = []
  private y: Vector = []

  constructor(opts: { k?: number } = {}) {
    super()
    this.k = opts.k ?? 5
  }

  override getParams(): { k: number } {
    return { k: this.k }
  }

  train(X: Matrix, y: Vector): this {
    if (X.length !== y.length) throw new Error('X and y length mismatch')
    this.X = X.map((row) => row.slice())
    this.y = y.slice()
    this.trained = true
    return this
  }

  infer(X: Matrix): Vector {
    if (!this.trained) throw new Error('KNN not trained')
    return X.map((row) => this._predictOne(row))
  }

  private _predictOne(x: Vector): number {
    const dists = this.X.map((row, i) => ({ d: euclidean(row, x), label: this.y[i]! }))
    dists.sort((a, b) => a.d - b.d)
    const top = dists.slice(0, this.k)
    const counts = new Map<number, number>()
    for (const { label } of top) counts.set(label, (counts.get(label) ?? 0) + 1)
    let bestLabel = top[0]?.label
    let bestCount = -1
    for (const [label, c] of counts)
      if (c > bestCount) {
        bestCount = c
        bestLabel = label
      }
    return bestLabel
  }
}

function euclidean(a: Vector, b: Vector): number {
  let s = 0
  for (let i = 0; i < a.length; i++) {
    const d = a[i]! - b[i]!
    s += d * d
  }
  return Math.sqrt(s)
}
