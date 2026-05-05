/**
 * Neural-network building blocks. Mirrors `nalyst.nn` and `neurova.neural`:
 * Module base class, Sequential, Linear, ReLU, Sigmoid, Tanh.
 */
import { Tensor } from './tensor'

export abstract class Module {
  abstract forward(x: Tensor): Tensor

  /** Recursive parameter collection. Modules expose `Tensor` fields that
   * carry `requiresGrad`. Sub-Modules are picked up via the `submodules` hook. */
  parameters(): Tensor[] {
    const out: Tensor[] = []
    for (const v of Object.values(this as Record<string, unknown>)) {
      if (v instanceof Tensor && v.requiresGrad) out.push(v)
      else if (v instanceof Module) out.push(...v.parameters())
      else if (Array.isArray(v)) {
        for (const item of v) {
          if (item instanceof Tensor && item.requiresGrad) out.push(item)
          else if (item instanceof Module) out.push(...item.parameters())
        }
      }
    }
    return out
  }

  zeroGrad(): void {
    for (const p of this.parameters()) p.zeroGrad()
  }
}

export class Linear extends Module {
  weight: Tensor
  bias: Tensor
  constructor(
    public readonly inFeatures: number,
    public readonly outFeatures: number,
    rng: () => number = Math.random,
  ) {
    super()
    // He-style init scaled for ReLU.
    const scale = Math.sqrt(2 / inFeatures)
    const w = new Float32Array(inFeatures * outFeatures)
    for (let i = 0; i < w.length; i++) w[i] = (rng() * 2 - 1) * scale
    this.weight = new Tensor(w, [inFeatures, outFeatures], true)
    this.bias = new Tensor(new Float32Array(outFeatures), [1, outFeatures], true)
  }
  forward(x: Tensor): Tensor {
    return x.matmul(this.weight).add(this.bias)
  }
}

export class ReLU extends Module {
  forward(x: Tensor): Tensor {
    return x.relu()
  }
}
export class Sigmoid extends Module {
  forward(x: Tensor): Tensor {
    return x.sigmoid()
  }
}
export class Tanh extends Module {
  forward(x: Tensor): Tensor {
    return x.tanh()
  }
}

export class Sequential extends Module {
  layers: Module[]
  constructor(...layers: Module[]) {
    super()
    this.layers = layers
  }
  forward(x: Tensor): Tensor {
    let y = x
    for (const l of this.layers) y = l.forward(y)
    return y
  }
}
