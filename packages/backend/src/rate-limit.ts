import { RateLimitError } from '@neurova/core'
import type { FastifyInstance, FastifyRequest } from 'fastify'

export interface RateLimitOptions {
  /** Window length in ms. Default 60_000. */
  windowMs?: number
  /** Max requests per window per key. Default 100. */
  max?: number
  /** Key extractor. Default uses ip + route. */
  keyGenerator?: (req: FastifyRequest) => string
}

interface Bucket {
  count: number
  resetAt: number
}

/**
 * Simple in-memory token-bucket rate limiter Fastify plugin. For multi-node
 * deployments, swap this with a redis implementation matching the same shape.
 */
export function rateLimit(opts: RateLimitOptions = {}) {
  const windowMs = opts.windowMs ?? 60_000
  const max = opts.max ?? 100
  const keyOf = opts.keyGenerator ?? ((req) => `${req.ip}:${req.routeOptions?.url ?? req.url}`)
  const buckets = new Map<string, Bucket>()

  return async function plugin(app: FastifyInstance): Promise<void> {
    app.addHook('onRequest', async (req) => {
      const key = keyOf(req)
      const now = Date.now()
      let b = buckets.get(key)
      if (!b || b.resetAt <= now) {
        b = { count: 0, resetAt: now + windowMs }
        buckets.set(key, b)
      }
      b.count++
      if (b.count > max) {
        throw new RateLimitError()
      }
    })
  }
}
