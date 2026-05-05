import { BaseLearner, type Matrix, type Vector } from './base'

/** Ordinary least-squares linear regression via the normal equations. */
export class LinearRegression extends BaseLearner {
  weights: Vector = []
  bias = 0

  constructor(_opts: Record<string, never> = {}) {
    super()
  }
  override getParams(): Record<string, never> {
    return {}
  }

  train(X: Matrix, y: Vector): this {
    // Solve (X^T X) w = X^T y with bias absorbed via augmentation.
    const n = X.length
    const d = X[0]?.length
    const Xa: Matrix = X.map((row) => [...row, 1])
    const cols = d + 1
    // XtX: cols x cols
    const XtX: Matrix = Array.from({ length: cols }, () => new Array(cols).fill(0))
    const Xty: Vector = new Array(cols).fill(0)
    for (let i = 0; i < n; i++) {
      const row = Xa[i]!
      for (let a = 0; a < cols; a++) {
        Xty[a] = (Xty[a] ?? 0) + row[a]! * y[i]!
        const XtXa = XtX[a]!
        for (let b = 0; b < cols; b++) XtXa[b] = (XtXa[b] ?? 0) + row[a]! * row[b]!
      }
    }
    const w = solve(XtX, Xty)
    this.weights = w.slice(0, d)
    this.bias = w[d]!
    this.trained = true
    return this
  }

  infer(X: Matrix): Vector {
    if (!this.trained) throw new Error('LinearRegression not trained')
    return X.map((row) => {
      let z = this.bias
      for (let j = 0; j < row.length; j++) z += this.weights[j]! * row[j]!
      return z
    })
  }
}

/** Gauss-Jordan elimination. Solves Ax = b for a small dense system. */
function solve(A: Matrix, b: Vector): Vector {
  const n = A.length
  const M: Matrix = A.map((row, i) => [...row, b[i]!])
  for (let col = 0; col < n; col++) {
    // Partial pivot.
    let pivot = col
    for (let r = col + 1; r < n; r++)
      if (Math.abs(M[r]?.[col]!) > Math.abs(M[pivot]?.[col]!)) pivot = r
    if (pivot !== col) [M[col], M[pivot]] = [M[pivot]!, M[col]!]
    const pv = M[col]?.[col]!
    if (Math.abs(pv) < 1e-12) throw new Error('singular matrix')
    for (let c = col; c <= n; c++) M[col]![c]! /= pv
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const factor = M[r]?.[col]!
      if (factor === 0) continue
      for (let c = col; c <= n; c++) M[r]![c]! -= factor * M[col]?.[c]!
    }
  }
  return M.map((row) => row[n]!)
}
