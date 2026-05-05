import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { createStore, useSignal, useStore } from '../src/index.js'

describe('@neurova/runtime', () => {
  it('useSignal works like useState', () => {
    const { result } = renderHook(() => useSignal(0))
    expect(result.current[0]).toBe(0)
    act(() => result.current[1](1))
    expect(result.current[0]).toBe(1)
    act(() => result.current[1]((n) => n + 1))
    expect(result.current[0]).toBe(2)
  })

  it('createStore + useStore subscribes to changes', () => {
    const store = createStore({ count: 0 })
    const { result } = renderHook(() => useStore(store, (s) => s.count))
    expect(result.current).toBe(0)
    act(() => store.setState({ count: 5 }))
    expect(result.current).toBe(5)
  })
})
