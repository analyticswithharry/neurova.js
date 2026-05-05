/**
 * Optimizers: SGD, Adam. Mirrors `nalyst.nn.optim` and `neurova.neural.optim`.
 */
import type { Tensor } from './tensor'

export abstract class Optimizer {
  constructor(public params: Tensor[]) {}
  abstract step(): void
  zeroGrad(): void { for (const p of this.params) p.zeroGrad() }
}

export class SGD extends Optimizer {
  constructor(params: Tensor[], public lr: number = 0.01, public momentum: number = 0) {
    super(params)
    if (momentum) this._velocity = params.map((p) => new Float32Array(p.size()))
  }
  private _velocity?: Float32Array[]
  step(): void {
    for (let i = 0; i < this.params.length; i++) {
      const p = this.params[i]!
      if (!p.grad) continue
      if (this.momentum && this._velocity) {
        const v = this._velocity[i]!
        for (let k = 0; k < p.data.length; k++) {
          v[k] = this.momentum * v[k]! + p.grad[k]!
          p.data[k]! -= this.lr * v[k]!
        }
      } else {
        for (let k = 0; k < p.data.length; k++) p.data[k]! -= this.lr * p.grad[k]!
      }
    }
  }
}

export class Adam extends Optimizer {
  private m: Float32Array[]
  private v: Float32Array[]
  private t = 0
  constructor(
    params: Tensor[],
    public lr: number = 1e-3,
    public beta1: number = 0.9,
    public beta2: number = 0.999,
    public eps: number = 1e-8,
  ) {
    super(params)
    this.m = params.map((p) => new Float32Array(p.size()))
    this.v = params.map((p) => new Float32Array(p.size()))
  }
  step(): void {
    this.t++
    const bc1 = 1 - Math.pow(this.beta1, this.t)
    const bc2 = 1 - Math.pow(this.beta2, this.t)
    for (let i = 0; i < this.params.length; i++) {
      const p = this.params[i]!
      if (!p.grad) continue
      const m = this.m[i]!, v = this.v[i]!
      for (let k = 0; k < p.data.length; k++) {
        const g = p.grad[k]!
        m[k] = this.beta1 * m[k]! + (1 - this.beta1) * g
        v[k] = this.beta2 * v[k]! + (1 - this.beta2) * g * g
        const mh = m[k]! / bc1, vh = v[k]! / bc2
        p.data[k]! -= this.lr * mh / (Math.sqrt(vh) + this.eps)
      }
    }
  }
}
