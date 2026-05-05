import { describe, expect, it } from 'vitest'
import { batch, computed, effect, signal, untrack } from '../src/reactivity.js'

describe('signal', () => {
  it('reads and writes', () => {
    const [count, setCount] = signal(0)
    expect(count()).toBe(0)
    setCount(5)
    expect(count()).toBe(5)
  })

  it('updater form receives previous value', () => {
    const [n, setN] = signal(10)
    setN((p) => p + 1)
    expect(n()).toBe(11)
  })
})

describe('effect', () => {
  it('runs immediately and on dependency change', () => {
    const [n, setN] = signal(0)
    const seen: number[] = []
    effect(() => {
      seen.push(n())
    })
    setN(1)
    setN(2)
    expect(seen).toEqual([0, 1, 2])
  })

  it('skips when value is unchanged (Object.is)', () => {
    const [n, setN] = signal(1)
    let runs = 0
    effect(() => {
      n()
      runs++
    })
    setN(1)
    expect(runs).toBe(1)
  })

  it('disposes cleanly', () => {
    const [n, setN] = signal(0)
    let runs = 0
    const dispose = effect(() => {
      n()
      runs++
    })
    dispose()
    setN(1)
    expect(runs).toBe(1)
  })
})

describe('computed', () => {
  it('derives from a signal', () => {
    const [n, setN] = signal(2)
    const doubled = computed(() => n() * 2)
    expect(doubled()).toBe(4)
    setN(5)
    expect(doubled()).toBe(10)
  })
})

describe('batch', () => {
  it('coalesces effect runs', () => {
    const [a, setA] = signal(1)
    const [b, setB] = signal(2)
    let runs = 0
    effect(() => {
      a()
      b()
      runs++
    })
    runs = 0
    batch(() => {
      setA(10)
      setB(20)
    })
    expect(runs).toBe(1)
  })
})

describe('untrack', () => {
  it('does not register dependencies', () => {
    const [n, setN] = signal(0)
    let runs = 0
    effect(() => {
      untrack(() => n())
      runs++
    })
    setN(99)
    expect(runs).toBe(1)
  })
})
