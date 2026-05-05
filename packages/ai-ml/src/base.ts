/**
 * BaseLearner — port of `nalyst.core.foundation.BaseLearner`.
 *
 * Convention preserved verbatim from nalyst:
 *   - models implement `.train(X, y)` and `.infer(X)` (NOT fit/predict)
 *   - `getParams()` / `setParams()` enable cloning + grid search
 *   - `duplicate(learner)` returns an unfitted copy
 */

export type Matrix = number[][]
export type Vector = number[]

export abstract class BaseLearner {
  /** Whether `train()` has populated the model. */
  trained = false

  /** Train the model on features X (n x d) and targets y (n). */
  abstract train(X: Matrix, y: Vector): this

  /** Predict targets for new feature rows. */
  abstract infer(X: Matrix): Vector

  /** Return the constructor parameter map. Subclasses override to expose hyperparams. */
  getParams(): Record<string, unknown> { return {} }

  /** Mutate hyperparameters in place; only allows existing keys. */
  setParams(params: Record<string, unknown>): this {
    const cur = this.getParams()
    for (const k of Object.keys(params)) {
      if (!(k in cur)) throw new Error(`Unknown parameter '${k}' for ${this.constructor.name}`)
      ;(this as unknown as Record<string, unknown>)[k] = params[k]
    }
    return this
  }
}

/** Create an unfitted clone of a learner. Mirrors `nalyst.duplicate`. */
export function duplicate<T extends BaseLearner>(learner: T): T {
  const Klass = learner.constructor as new (...args: any[]) => T
  // Reconstruct via getParams; assumes constructor accepts a single options object.
  const fresh = new Klass(learner.getParams() as any)
  return fresh
}
