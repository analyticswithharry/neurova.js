/**
 * Pluggable cache interface. Default in-memory implementation; swap for redis
 * via createRedisCache() (provide your own ioredis client).
 */
export interface Cache {
  get<T = unknown>(key: string): Promise<T | null>
  set(key: string, value: unknown, ttlMs?: number): Promise<void>
  del(key: string): Promise<void>
  clear(): Promise<void>
}

interface MemEntry {
  value: unknown
  expiresAt: number | null
}

export function createMemoryCache(): Cache {
  const store = new Map<string, MemEntry>()
  const isAlive = (e: MemEntry) => e.expiresAt === null || e.expiresAt > Date.now()
  return {
    async get(key) {
      const e = store.get(key)
      if (!e) return null
      if (!isAlive(e)) {
        store.delete(key)
        return null
      }
      return e.value as never
    },
    async set(key, value, ttlMs) {
      store.set(key, { value, expiresAt: ttlMs ? Date.now() + ttlMs : null })
    },
    async del(key) {
      store.delete(key)
    },
    async clear() {
      store.clear()
    },
  }
}

/** Wrap any redis-compatible client (ioredis / node-redis) into our Cache interface. */
export interface RedisLike {
  get(key: string): Promise<string | null>
  set(key: string, value: string, mode?: 'PX', ms?: number): Promise<unknown>
  del(key: string): Promise<unknown>
  flushdb?(): Promise<unknown>
}

export function createRedisCache(client: RedisLike): Cache {
  return {
    async get(key) {
      const v = await client.get(key)
      return v === null ? null : (JSON.parse(v) as never)
    },
    async set(key, value, ttlMs) {
      const serialized = JSON.stringify(value)
      if (ttlMs) await client.set(key, serialized, 'PX', ttlMs)
      else await client.set(key, serialized)
    },
    async del(key) {
      await client.del(key)
    },
    async clear() {
      await client.flushdb?.()
    },
  }
}
