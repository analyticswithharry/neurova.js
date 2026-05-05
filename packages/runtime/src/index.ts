/**
 * @neurova/runtime
 *
 * React + TypeScript reactive helpers for neurova apps.
 * Thin, ergonomic wrappers around React's built-in primitives plus a
 * tiny external store helper backed by `useSyncExternalStore`.
 *
 * Authored by @analyticswithharry and Squid Consultancy Group Ltd.
 * MIT licensed.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'
import type { DependencyList } from 'react'

/** A signal-style hook: identical surface to React's `useState`. */
export function useSignal<T>(initial: T | (() => T)): [T, (next: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(initial)
  return [value, setValue]
}

/** Memoised derived value. */
export function useComputed<T>(compute: () => T, deps: DependencyList): T {
  // biome-ignore lint/correctness/useExhaustiveDependencies: caller-controlled deps
  return useMemo(compute, deps)
}

/** Stable callback identity that always sees the latest `fn`. */
export function useEvent<A extends unknown[], R>(fn: (...args: A) => R): (...args: A) => R {
  const ref = useRef(fn)
  useEffect(() => {
    ref.current = fn
  })
  return useCallback((...args: A) => ref.current(...args), [])
}

/** A minimal external store. Subscribe + snapshot are stable. */
export interface Store<T> {
  getState: () => T
  setState: (next: T | ((prev: T) => T)) => void
  subscribe: (listener: () => void) => () => void
}

export function createStore<T>(initial: T): Store<T> {
  let state = initial
  const listeners = new Set<() => void>()
  return {
    getState: () => state,
    setState: (next) => {
      const value =
        typeof next === 'function' ? (next as (prev: T) => T)(state) : next
      if (Object.is(value, state)) return
      state = value
      for (const l of listeners) l()
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

/** Subscribe a component to a store with selector + equality. */
export function useStore<T, S = T>(
  store: Store<T>,
  selector: (state: T) => S = (s) => s as unknown as S,
  isEqual: (a: S, b: S) => boolean = Object.is,
): S {
  const lastSelected = useRef<{ state: T; selected: S } | null>(null)
  const getSnapshot = useCallback((): S => {
    const state = store.getState()
    const last = lastSelected.current
    if (last && Object.is(last.state, state)) return last.selected
    const selected = selector(state)
    if (last && isEqual(last.selected, selected)) {
      lastSelected.current = { state, selected: last.selected }
      return last.selected
    }
    lastSelected.current = { state, selected }
    return selected
  }, [store, selector, isEqual])
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot)
}

export const VERSION = '2.2.2'
export const FRAMEWORK_NAME = 'neurova'
