/**
 * neurova/runtime — reactivity core
 *
 * Original implementation. Signals + effects + computed values with
 * synchronous, push-based dependency tracking. No external deps.
 *
 * Design notes:
 *  - `signal(value)` returns a tuple `[read, write]`. Reads register the
 *    current observer (if any) as a dependency; writes notify observers.
 *  - `effect(fn)` runs `fn` immediately and re-runs whenever any signal
 *    read inside it changes.
 *  - `computed(fn)` is a derived signal that lazily recomputes.
 *  - `batch(fn)` defers all effect re-runs until the batch closes,
 *    coalescing duplicate invocations.
 */

type Subscriber = {
  fn: () => void
  deps: Set<Set<Subscriber>>
}

let currentObserver: Subscriber | null = null
let batchDepth = 0
const pending = new Set<Subscriber>()

function flush(): void {
  if (batchDepth > 0) return
  const queue = Array.from(pending)
  pending.clear()
  for (const sub of queue) {
    runSubscriber(sub)
  }
}

function runSubscriber(sub: Subscriber): void {
  // Clear previous deps so we re-track fresh on each run.
  for (const dep of sub.deps) dep.delete(sub)
  sub.deps.clear()
  const prev = currentObserver
  currentObserver = sub
  try {
    sub.fn()
  } finally {
    currentObserver = prev
  }
}

export type Signal<T> = readonly [() => T, (next: T | ((prev: T) => T)) => void]

export function signal<T>(initial: T): Signal<T> {
  let value = initial
  const subs = new Set<Subscriber>()

  const read = (): T => {
    if (currentObserver) {
      subs.add(currentObserver)
      currentObserver.deps.add(subs)
    }
    return value
  }

  const write = (next: T | ((prev: T) => T)): void => {
    const resolved =
      typeof next === 'function' ? (next as (p: T) => T)(value) : next
    if (Object.is(resolved, value)) return
    value = resolved
    for (const sub of subs) pending.add(sub)
    flush()
  }

  return [read, write] as const
}

export function effect(fn: () => void): () => void {
  const sub: Subscriber = { fn, deps: new Set() }
  runSubscriber(sub)
  return () => {
    for (const dep of sub.deps) dep.delete(sub)
    sub.deps.clear()
    pending.delete(sub)
  }
}

export function computed<T>(fn: () => T): () => T {
  const [read, write] = signal<T>(undefined as unknown as T)
  let initialised = false
  effect(() => {
    const next = fn()
    if (!initialised) {
      initialised = true
      write(next)
    } else {
      write(next)
    }
  })
  return read
}

export function batch<T>(fn: () => T): T {
  batchDepth++
  try {
    return fn()
  } finally {
    batchDepth--
    flush()
  }
}

/** Read a signal without registering it as a dependency. */
export function untrack<T>(fn: () => T): T {
  const prev = currentObserver
  currentObserver = null
  try {
    return fn()
  } finally {
    currentObserver = prev
  }
}
