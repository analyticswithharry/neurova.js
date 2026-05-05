/**
 * Loss functions. Each returns a scalar `Tensor` ready for `.backward()`.
 */
import { Tensor } from './tensor'

/** Mean-squared error. */
export function mseLoss(pred: Tensor, target: Tensor): Tensor {
  const d = pred.sub(target)
  return d.mul(d).mean()
}

/** Binary cross-entropy with logits stability via clipping. */
export function bceLoss(pred: Tensor, target: Tensor): Tensor {
  // -[y log(p) + (1 - y) log(1 - p)]
  const eps = 1e-7
  const one = Tensor.ones(pred.shape)
  const clipped = clipForward(pred, eps, 1 - eps)
  const a = target.mul(clipped.log())
  const b = one.sub(target).mul(one.sub(clipped).log())
  return a.add(b).mean().neg()
}

/** Cross-entropy from probability rows. `target` is one-hot, same shape as pred. */
export function crossEntropyLoss(pred: Tensor, target: Tensor): Tensor {
  const eps = 1e-7
  const clipped = clipForward(pred, eps, 1 - eps)
  return target.mul(clipped.log()).sum().neg().div(pred.shape[0]!)
}

/** Forward-only clip; gradient flows as-is for in-range values. */
function clipForward(t: Tensor, lo: number, hi: number): Tensor {
  const out = new Float32Array(t.size())
  for (let i = 0; i < t.data.length; i++) out[i] = Math.min(hi, Math.max(lo, t.data[i]!))
  // Reuse tensor's autograd by constructing a tensor whose grad equals incoming grad.
  // We do this by `t.add(0)`-style identity through binOp; cheaper to just build node manually.
  const r = new Tensor(out, t.shape, t.requiresGrad)
  if (t.requiresGrad) {
    ;(r as any)._node = { parents: [t], backward: (g: Float32Array) => [g.slice()] }
  }
  return r
}
