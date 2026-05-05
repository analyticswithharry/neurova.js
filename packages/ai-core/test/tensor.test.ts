import { describe, it, expect } from 'vitest'
import { Tensor, Linear, Sequential, ReLU, SGD, Adam, mseLoss } from '../src'

describe('Tensor', () => {
  it('constructs with shape', () => {
    const t = new Tensor([1, 2, 3, 4], [2, 2])
    expect(t.shape).toEqual([2, 2])
    expect(Array.from(t.data)).toEqual([1, 2, 3, 4])
  })

  it('elementwise add with broadcast', () => {
    const a = new Tensor([1, 2, 3, 4], [2, 2])
    const b = new Tensor([10, 20], [1, 2])
    const c = a.add(b)
    expect(Array.from(c.data)).toEqual([11, 22, 13, 24])
  })

  it('matmul forward', () => {
    const a = new Tensor([1, 2, 3, 4], [2, 2])
    const b = new Tensor([5, 6, 7, 8], [2, 2])
    const c = a.matmul(b)
    expect(Array.from(c.data)).toEqual([19, 22, 43, 50])
  })

  it('autograd: dy/dx for y = x^2 at x=3 is 6', () => {
    const x = new Tensor([3], [1], true)
    const y = x.pow(2)
    y.backward()
    expect(x.grad?.[0]).toBeCloseTo(6, 5)
  })

  it('autograd: chain rule through relu', () => {
    const x = new Tensor([-1, 2], [2], true)
    const y = x.relu().sum()
    y.backward()
    expect(Array.from(x.grad!)).toEqual([0, 1])
  })

  it('autograd: matmul gradients shape-correct', () => {
    const a = new Tensor([1, 2, 3, 4, 5, 6], [2, 3], true)
    const b = new Tensor([1, 0, 0, 1, 1, 0], [3, 2], true)
    const y = a.matmul(b).sum()
    y.backward()
    expect(a.grad?.length).toBe(6)
    expect(b.grad?.length).toBe(6)
  })
})

describe('nn + optim', () => {
  it('Linear has correct param shapes', () => {
    const l = new Linear(3, 2)
    const p = l.parameters()
    expect(p.length).toBe(2)
    expect(p[0]!.shape).toEqual([3, 2])
    expect(p[1]!.shape).toEqual([1, 2])
  })

  it('Sequential collects params from all layers', () => {
    const m = new Sequential(new Linear(4, 8), new ReLU(), new Linear(8, 1))
    expect(m.parameters().length).toBe(4)
  })

  it('SGD reduces MSE loss on a tiny linear regression', () => {
    // Fit y = 2x + 1 on a few points.
    let seed = 1
    const rng = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff
      return seed / 0x7fffffff
    }
    const model = new Sequential(new Linear(1, 1, rng))
    const opt = new SGD(model.parameters(), 0.05)
    const X = new Tensor([0, 1, 2, 3], [4, 1])
    const Y = new Tensor([1, 3, 5, 7], [4, 1])
    let firstLoss = 0, lastLoss = 0
    for (let epoch = 0; epoch < 200; epoch++) {
      opt.zeroGrad()
      const pred = model.forward(X)
      const loss = mseLoss(pred, Y)
      loss.backward()
      opt.step()
      if (epoch === 0) firstLoss = loss.data[0]!
      lastLoss = loss.data[0]!
    }
    expect(lastLoss).toBeLessThan(firstLoss)
    expect(lastLoss).toBeLessThan(0.1)
  })

  it('Adam optimizer runs and reduces loss', () => {
    let seed = 42
    const rng = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff }
    const model = new Sequential(new Linear(1, 1, rng))
    const opt = new Adam(model.parameters(), 0.05)
    const X = new Tensor([0, 1, 2, 3], [4, 1])
    const Y = new Tensor([1, 3, 5, 7], [4, 1])
    let last = 0
    for (let i = 0; i < 100; i++) {
      opt.zeroGrad()
      const loss = mseLoss(model.forward(X), Y)
      loss.backward()
      opt.step()
      last = loss.data[0]!
    }
    expect(last).toBeLessThan(0.5)
  })
})
