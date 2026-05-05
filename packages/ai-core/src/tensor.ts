/**
 * @neurova/ai-core — Tensor + reverse-mode autograd over Float32Array.
 *
 * Design notes:
 * - Strided n-dim tensor backed by a single contiguous Float32Array.
 * - Each Tensor optionally tracks an autograd node; backward() walks a
 *   topologically-sorted tape and accumulates `grad` (also a Float32Array).
 * - Shapes use `number[]`; broadcasting follows NumPy rules for elementwise ops.
 * - All ops are pure, return new Tensors, never mutate input data buffers.
 */

export type Shape = readonly number[]

/** Compute the product of a shape (number of elements). */
export function numel(shape: Shape): number {
  let n = 1
  for (const d of shape) n *= d
  return n
}

/** Row-major contiguous strides for a shape. */
export function computeStrides(shape: Shape): number[] {
  const strides = new Array<number>(shape.length)
  let s = 1
  for (let i = shape.length - 1; i >= 0; i--) {
    strides[i] = s
    s *= shape[i]!
  }
  return strides
}

function shapesEqual(a: Shape, b: Shape): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

/** Broadcast two shapes per NumPy rules. Throws if incompatible. */
export function broadcastShapes(a: Shape, b: Shape): number[] {
  const out: number[] = []
  const n = Math.max(a.length, b.length)
  for (let i = 0; i < n; i++) {
    const ad = a[a.length - 1 - i] ?? 1
    const bd = b[b.length - 1 - i] ?? 1
    if (ad !== bd && ad !== 1 && bd !== 1) {
      throw new Error(`cannot broadcast shapes [${a}] and [${b}]`)
    }
    out.unshift(Math.max(ad, bd))
  }
  return out
}

/** Reduce a broadcasted gradient back to the original shape by summing axes. */
function unbroadcast(grad: Float32Array, gradShape: Shape, target: Shape): Float32Array {
  if (shapesEqual(gradShape, target)) return grad
  // Pad target with leading 1s.
  const padded = new Array(gradShape.length - target.length).fill(1).concat(target as number[])
  let cur = grad
  let curShape = gradShape.slice() as number[]
  // Sum across axes where target dim is 1 but grad dim is > 1.
  for (let axis = 0; axis < curShape.length; axis++) {
    if (padded[axis] === 1 && curShape[axis]! > 1) {
      cur = sumAxis(cur, curShape, axis)
      curShape[axis] = 1
    }
  }
  // Squeeze leading 1s to match the target rank.
  while (curShape.length > target.length) {
    curShape.shift()
  }
  return cur
}

function sumAxis(data: Float32Array, shape: number[], axis: number): Float32Array {
  const strides = computeStrides(shape)
  const outShape = shape.slice()
  outShape[axis] = 1
  const outSize = numel(outShape)
  const out = new Float32Array(outSize)
  const outStrides = computeStrides(outShape)
  const total = data.length
  const dim = shape[axis]!
  const stride = strides[axis]!
  for (let i = 0; i < total; i++) {
    // Decompose i into multi-index, project onto outShape (axis -> 0).
    let rem = i
    let outIdx = 0
    for (let d = 0; d < shape.length; d++) {
      const coord = Math.floor(rem / strides[d]!)
      rem -= coord * strides[d]!
      const oc = d === axis ? 0 : coord
      outIdx += oc * outStrides[d]!
    }
    out[outIdx]! += data[i]!
    void dim
    void stride
  }
  return out
}

/** Iterate over each multi-index of a shape, returning the flat index. */
function* indices(shape: Shape): Generator<{ idx: number; coord: number[] }> {
  const n = numel(shape)
  const strides = computeStrides(shape)
  for (let i = 0; i < n; i++) {
    const coord = new Array<number>(shape.length)
    let rem = i
    for (let d = 0; d < shape.length; d++) {
      coord[d] = Math.floor(rem / strides[d]!)
      rem -= coord[d]! * strides[d]!
    }
    yield { idx: i, coord }
  }
}

/** Map a coordinate in `outShape` to a flat index in `srcShape` using broadcasting. */
function broadcastIndex(coord: number[], srcShape: Shape, srcStrides: number[]): number {
  const offset = coord.length - srcShape.length
  let idx = 0
  for (let d = 0; d < srcShape.length; d++) {
    const c = coord[d + offset]!
    const sd = srcShape[d]!
    idx += (sd === 1 ? 0 : c) * srcStrides[d]!
  }
  return idx
}

interface Node {
  parents: Tensor[]
  // Receive grad wrt output, return grads wrt each parent (already unbroadcast).
  backward: (grad: Float32Array) => Float32Array[]
}

export class Tensor {
  readonly shape: number[]
  readonly data: Float32Array
  readonly strides: number[]
  requiresGrad: boolean
  grad: Float32Array | null = null
  /** @internal */ _node: Node | null = null

  constructor(data: ArrayLike<number> | Float32Array, shape: Shape, requiresGrad = false) {
    const buf = data instanceof Float32Array ? data : Float32Array.from(data)
    if (buf.length !== numel(shape)) {
      throw new Error(`data length ${buf.length} does not match shape [${shape}] (${numel(shape)})`)
    }
    this.data = buf
    this.shape = shape.slice()
    this.strides = computeStrides(shape)
    this.requiresGrad = requiresGrad
  }

  static zeros(shape: Shape, requiresGrad = false): Tensor {
    return new Tensor(new Float32Array(numel(shape)), shape, requiresGrad)
  }

  static ones(shape: Shape, requiresGrad = false): Tensor {
    const a = new Float32Array(numel(shape))
    a.fill(1)
    return new Tensor(a, shape, requiresGrad)
  }

  static full(shape: Shape, value: number, requiresGrad = false): Tensor {
    const a = new Float32Array(numel(shape))
    a.fill(value)
    return new Tensor(a, shape, requiresGrad)
  }

  /** Random uniform on [0, 1). Pass a seeded RNG for reproducibility. */
  static rand(shape: Shape, rng: () => number = Math.random, requiresGrad = false): Tensor {
    const a = new Float32Array(numel(shape))
    for (let i = 0; i < a.length; i++) a[i] = rng()
    return new Tensor(a, shape, requiresGrad)
  }

  /** Random standard-normal via Box–Muller. */
  static randn(shape: Shape, rng: () => number = Math.random, requiresGrad = false): Tensor {
    const a = new Float32Array(numel(shape))
    for (let i = 0; i < a.length; i += 2) {
      const u1 = Math.max(rng(), 1e-12)
      const u2 = rng()
      const r = Math.sqrt(-2 * Math.log(u1))
      a[i] = r * Math.cos(2 * Math.PI * u2)
      if (i + 1 < a.length) a[i + 1] = r * Math.sin(2 * Math.PI * u2)
    }
    return new Tensor(a, shape, requiresGrad)
  }

  static fromArray(arr: number[] | number[][] | number[][][], requiresGrad = false): Tensor {
    const shape: number[] = []
    let cur: unknown = arr
    while (Array.isArray(cur)) {
      shape.push((cur as unknown[]).length)
      cur = (cur as unknown[])[0]
    }
    const flat: number[] = []
    const recur = (x: unknown): void => {
      if (Array.isArray(x)) for (const v of x) recur(v)
      else flat.push(x as number)
    }
    recur(arr)
    return new Tensor(Float32Array.from(flat), shape, requiresGrad)
  }

  toArray(): number[] | number[][] | number[][][] {
    return reshapeTo(Array.from(this.data), this.shape)
  }

  size(): number { return this.data.length }

  clone(): Tensor {
    return new Tensor(this.data.slice(), this.shape, this.requiresGrad)
  }

  /** Trigger reverse-mode AD. The receiver must be a scalar (numel === 1). */
  backward(): void {
    if (this.size() !== 1) throw new Error('backward() only supported for scalar outputs')
    // Topo sort.
    const order: Tensor[] = []
    const seen = new Set<Tensor>()
    const visit = (t: Tensor): void => {
      if (seen.has(t)) return
      seen.add(t)
      if (t._node) for (const p of t._node.parents) visit(p)
      order.push(t)
    }
    visit(this)
    // Seed grad.
    this.grad = new Float32Array([1])
    for (let i = order.length - 1; i >= 0; i--) {
      const t = order[i]!
      if (!t._node || !t.grad) continue
      const grads = t._node.backward(t.grad)
      for (let p = 0; p < t._node.parents.length; p++) {
        const parent = t._node.parents[p]!
        if (!parent.requiresGrad) continue
        if (!parent.grad) parent.grad = new Float32Array(parent.size())
        const g = grads[p]!
        for (let k = 0; k < g.length; k++) parent.grad[k]! += g[k]!
      }
    }
  }

  zeroGrad(): void { this.grad = null }

  // ------- elementwise ops -------
  add(other: Tensor | number): Tensor { return binOp(this, asTensor(other), 'add') }
  sub(other: Tensor | number): Tensor { return binOp(this, asTensor(other), 'sub') }
  mul(other: Tensor | number): Tensor { return binOp(this, asTensor(other), 'mul') }
  div(other: Tensor | number): Tensor { return binOp(this, asTensor(other), 'div') }
  neg(): Tensor { return this.mul(-1) }
  pow(p: number): Tensor { return powScalar(this, p) }
  exp(): Tensor { return unaryOp(this, 'exp') }
  log(): Tensor { return unaryOp(this, 'log') }
  relu(): Tensor { return unaryOp(this, 'relu') }
  sigmoid(): Tensor { return unaryOp(this, 'sigmoid') }
  tanh(): Tensor { return unaryOp(this, 'tanh') }
  sum(): Tensor { return sum(this) }
  mean(): Tensor { return mean(this) }

  /** 2-D matmul. (m,k) @ (k,n) -> (m,n). */
  matmul(other: Tensor): Tensor { return matmul(this, other) }
}

function asTensor(v: Tensor | number): Tensor {
  return v instanceof Tensor ? v : new Tensor([v], [1])
}

function reshapeTo(flat: number[], shape: number[]): any {
  if (shape.length <= 1) return flat
  const [head, ...rest] = shape
  const block = numel(rest)
  const out: any[] = []
  for (let i = 0; i < head!; i++) out.push(reshapeTo(flat.slice(i * block, (i + 1) * block), rest))
  return out
}

function binOp(a: Tensor, b: Tensor, op: 'add' | 'sub' | 'mul' | 'div'): Tensor {
  const outShape = broadcastShapes(a.shape, b.shape)
  const out = new Float32Array(numel(outShape))
  const aStr = a.strides, bStr = b.strides
  for (const { idx, coord } of indices(outShape)) {
    const av = a.data[broadcastIndex(coord, a.shape, aStr)]!
    const bv = b.data[broadcastIndex(coord, b.shape, bStr)]!
    out[idx] = op === 'add' ? av + bv : op === 'sub' ? av - bv : op === 'mul' ? av * bv : av / bv
  }
  const t = new Tensor(out, outShape, a.requiresGrad || b.requiresGrad)
  if (t.requiresGrad) {
    t._node = {
      parents: [a, b],
      backward: (g) => {
        let ga: Float32Array
        let gb: Float32Array
        if (op === 'add') { ga = g.slice(); gb = g.slice() }
        else if (op === 'sub') { ga = g.slice(); gb = g.slice(); for (let i = 0; i < gb.length; i++) gb[i] = -gb[i]! }
        else if (op === 'mul') {
          ga = new Float32Array(g.length); gb = new Float32Array(g.length)
          let k = 0
          for (const { coord } of indices(outShape)) {
            const av = a.data[broadcastIndex(coord, a.shape, aStr)]!
            const bv = b.data[broadcastIndex(coord, b.shape, bStr)]!
            ga[k] = g[k]! * bv; gb[k] = g[k]! * av; k++
          }
        } else {
          ga = new Float32Array(g.length); gb = new Float32Array(g.length)
          let k = 0
          for (const { coord } of indices(outShape)) {
            const av = a.data[broadcastIndex(coord, a.shape, aStr)]!
            const bv = b.data[broadcastIndex(coord, b.shape, bStr)]!
            ga[k] = g[k]! / bv
            gb[k] = -g[k]! * av / (bv * bv)
            k++
          }
        }
        return [unbroadcast(ga, outShape, a.shape), unbroadcast(gb, outShape, b.shape)]
      },
    }
  }
  return t
}

function unaryOp(a: Tensor, op: 'exp' | 'log' | 'relu' | 'sigmoid' | 'tanh'): Tensor {
  const out = new Float32Array(a.size())
  for (let i = 0; i < a.data.length; i++) {
    const x = a.data[i]!
    out[i] = op === 'exp' ? Math.exp(x)
      : op === 'log' ? Math.log(x)
      : op === 'relu' ? Math.max(0, x)
      : op === 'sigmoid' ? 1 / (1 + Math.exp(-x))
      : Math.tanh(x)
  }
  const t = new Tensor(out, a.shape, a.requiresGrad)
  if (t.requiresGrad) {
    t._node = {
      parents: [a],
      backward: (g) => {
        const ga = new Float32Array(g.length)
        for (let i = 0; i < g.length; i++) {
          const x = a.data[i]!, y = out[i]!
          const d = op === 'exp' ? y
            : op === 'log' ? 1 / x
            : op === 'relu' ? (x > 0 ? 1 : 0)
            : op === 'sigmoid' ? y * (1 - y)
            : 1 - y * y
          ga[i] = g[i]! * d
        }
        return [ga]
      },
    }
  }
  return t
}

function powScalar(a: Tensor, p: number): Tensor {
  const out = new Float32Array(a.size())
  for (let i = 0; i < a.data.length; i++) out[i] = Math.pow(a.data[i]!, p)
  const t = new Tensor(out, a.shape, a.requiresGrad)
  if (t.requiresGrad) {
    t._node = {
      parents: [a],
      backward: (g) => {
        const ga = new Float32Array(g.length)
        for (let i = 0; i < g.length; i++) ga[i] = g[i]! * p * Math.pow(a.data[i]!, p - 1)
        return [ga]
      },
    }
  }
  return t
}

function sum(a: Tensor): Tensor {
  let s = 0
  for (let i = 0; i < a.data.length; i++) s += a.data[i]!
  const t = new Tensor([s], [1], a.requiresGrad)
  if (t.requiresGrad) {
    t._node = {
      parents: [a],
      backward: (g) => {
        const ga = new Float32Array(a.size())
        ga.fill(g[0]!)
        return [ga]
      },
    }
  }
  return t
}

function mean(a: Tensor): Tensor {
  const n = a.size()
  const t = sum(a).div(n)
  return t
}

function matmul(a: Tensor, b: Tensor): Tensor {
  if (a.shape.length !== 2 || b.shape.length !== 2) throw new Error('matmul requires 2-D tensors')
  const [m, k] = a.shape, [k2, n] = b.shape
  if (k !== k2) throw new Error(`matmul shape mismatch: (${m},${k}) @ (${k2},${n})`)
  const out = new Float32Array(m! * n!)
  for (let i = 0; i < m!; i++) {
    for (let j = 0; j < n!; j++) {
      let s = 0
      for (let p = 0; p < k!; p++) s += a.data[i * k! + p]! * b.data[p * n! + j]!
      out[i * n! + j] = s
    }
  }
  const t = new Tensor(out, [m!, n!], a.requiresGrad || b.requiresGrad)
  if (t.requiresGrad) {
    t._node = {
      parents: [a, b],
      backward: (g) => {
        // dL/dA = g @ B^T, dL/dB = A^T @ g
        const ga = new Float32Array(m! * k!)
        const gb = new Float32Array(k! * n!)
        for (let i = 0; i < m!; i++) {
          for (let p = 0; p < k!; p++) {
            let s = 0
            for (let j = 0; j < n!; j++) s += g[i * n! + j]! * b.data[p * n! + j]!
            ga[i * k! + p] = s
          }
        }
        for (let p = 0; p < k!; p++) {
          for (let j = 0; j < n!; j++) {
            let s = 0
            for (let i = 0; i < m!; i++) s += a.data[i * k! + p]! * g[i * n! + j]!
            gb[p * n! + j] = s
          }
        }
        return [ga, gb]
      },
    }
  }
  return t
}
