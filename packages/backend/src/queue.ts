import { EventBus } from '@neurova/core'

export type JobHandler<T> = (data: T) => Promise<void> | void

interface Job<T> {
  id: string
  data: T
  attempts: number
  runAt: number
}

export interface QueueOptions {
  /** Max concurrent workers. Default 4. */
  concurrency?: number
  /** Max retry attempts. Default 3. */
  maxAttempts?: number
  /** Initial backoff in ms. Default 500. Applied as exponential backoff. */
  backoffMs?: number
}

/**
 * In-process job queue with retry + backoff. For production redis-backed
 * jobs, plug in a BullMQ-compatible adapter that satisfies the same shape.
 */
export class Queue<T = unknown> {
  private q: Job<T>[] = []
  private active = 0
  private handler: JobHandler<T> | null = null
  private readonly opts: Required<QueueOptions>
  private timer: ReturnType<typeof setTimeout> | null = null
  readonly events = new EventBus<{
    completed: { id: string }
    failed: { id: string; error: unknown; attempts: number }
  }>()

  constructor(opts: QueueOptions = {}) {
    this.opts = {
      concurrency: opts.concurrency ?? 4,
      maxAttempts: opts.maxAttempts ?? 3,
      backoffMs: opts.backoffMs ?? 500,
    }
  }

  process(handler: JobHandler<T>): void {
    this.handler = handler
    this.tick()
  }

  add(data: T, id = `job_${Math.random().toString(36).slice(2, 10)}`): string {
    this.q.push({ id, data, attempts: 0, runAt: Date.now() })
    this.tick()
    return id
  }

  size(): number {
    return this.q.length
  }

  private tick(): void {
    if (!this.handler) return
    while (this.active < this.opts.concurrency) {
      const idx = this.q.findIndex((j) => j.runAt <= Date.now())
      if (idx === -1) break
      const job = this.q.splice(idx, 1)[0]!
      this.active++
      Promise.resolve()
        .then(() => this.handler?.(job.data))
        .then(() => {
          this.active--
          this.events.emit('completed', { id: job.id })
          this.tick()
        })
        .catch((error) => {
          this.active--
          job.attempts++
          if (job.attempts < this.opts.maxAttempts) {
            const delay = this.opts.backoffMs * 2 ** (job.attempts - 1)
            job.runAt = Date.now() + delay
            this.q.push(job)
            if (this.timer) clearTimeout(this.timer)
            this.timer = setTimeout(() => this.tick(), delay)
          } else {
            this.events.emit('failed', { id: job.id, error, attempts: job.attempts })
          }
          this.tick()
        })
    }
  }
}
