type Listener<T> = (payload: T) => void | Promise<void>

/**
 * Tiny typed event bus. Synchronous fan-out, errors are isolated per listener.
 *
 * @example
 * const bus = new EventBus<{ 'user.created': { id: string } }>()
 * bus.on('user.created', (u) => console.log(u.id))
 * bus.emit('user.created', { id: '1' })
 */
export class EventBus<EventMap extends Record<string, unknown> = Record<string, unknown>> {
  private listeners = new Map<keyof EventMap, Set<Listener<unknown>>>()

  on<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): () => void {
    let set = this.listeners.get(event)
    if (!set) {
      set = new Set()
      this.listeners.set(event, set)
    }
    set.add(listener as Listener<unknown>)
    return () => this.off(event, listener)
  }

  once<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): () => void {
    const wrap: Listener<EventMap[K]> = (p) => {
      off()
      return listener(p)
    }
    const off = this.on(event, wrap)
    return off
  }

  off<K extends keyof EventMap>(event: K, listener: Listener<EventMap[K]>): void {
    this.listeners.get(event)?.delete(listener as Listener<unknown>)
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const set = this.listeners.get(event)
    if (!set) return
    for (const fn of set) {
      try {
        const r = (fn as Listener<EventMap[K]>)(payload)
        if (r && typeof (r as Promise<void>).catch === 'function') {
          ;(r as Promise<void>).catch(() => {})
        }
      } catch {
        /* isolate listener errors */
      }
    }
  }

  removeAll(event?: keyof EventMap): void {
    if (event) this.listeners.delete(event)
    else this.listeners.clear()
  }
}
