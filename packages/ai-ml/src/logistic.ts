import { BaseLearner, type Matrix, type Vector } from './base'

/**
 * Logistic regression classifier (binary). Port of
 * `nalyst.learners.linear.LogisticLearner`. Uses gradient descent on the
 * negative log-likelihood with optional L2 regularization.
 */
export class LogisticLearner extends BaseLearner {
  strength: number // L2 regularization strength (lambda)
  lr: number
  epochs: number
  private weights: Vector = []
  private bias = 0

  constructor(opts: { strength?: number; lr?: number; epochs?: number } = {}) {
    super()
    this.strength = opts.strength ?? 0.0
    this.lr = opts.lr ?? 0.1
    this.epochs = opts.epochs ?? 200
  }

  override getParams(): { strength: number; lr: number; epochs: number } {
    return { strength: this.strength, lr: this.lr, epochs: this.epochs }
  }

  train(X: Matrix, y: Vector): this {
    const n = X.length
    if (n === 0) throw new Error('empty training set')
    const d = X[0]?.length
    this.weights = new Array(d).fill(0)
    this.bias = 0
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      const gradW = new Array(d).fill(0)
      let gradB = 0
      for (let i = 0; i < n; i++) {
        const row = X[i]!
        let z = this.bias
        for (let j = 0; j < d; j++) z += this.weights[j]! * row[j]!
        const p = sigmoid(z)
        const err = p - y[i]!
        for (let j = 0; j < d; j++) gradW[j] += err * row[j]!
        gradB += err
      }
      for (let j = 0; j < d; j++) {
        const reg = this.strength * this.weights[j]!
        this.weights[j] = this.weights[j]! - this.lr * (gradW[j]! / n + reg)
      }
      this.bias -= this.lr * (gradB / n)
    }
    this.trained = true
    return this
  }

  infer(X: Matrix): Vector {
    if (!this.trained) throw new Error('LogisticLearner not trained')
    return X.map((row) => {
      let z = this.bias
      for (let j = 0; j < row.length; j++) z += this.weights[j]! * row[j]!
      return sigmoid(z) >= 0.5 ? 1 : 0
    })
  }

  inferProba(X: Matrix): Vector {
    return X.map((row) => {
      let z = this.bias
      for (let j = 0; j < row.length; j++) z += this.weights[j]! * row[j]!
      return sigmoid(z)
    })
  }
}

function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z))
}
