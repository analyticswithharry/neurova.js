export default function Page() {
  return (
    <article>
      <h1>@neurova/backend</h1>
      <p>Fastify-based HTTP server, pre-wired with auth, rate-limit, cache, queue, and websocket helpers.</p>

      <h2>Server</h2>
      <pre>{`import { createServer, startServer } from '@neurova/backend'

const app = await createServer({ logger: true })
app.get('/hello', () => ({ ok: true }))
await startServer(app, 3000)`}</pre>

      <h2>Auth (JWT)</h2>
      <pre>{`import { registerAuth } from '@neurova/backend/auth'

await registerAuth(app, { secret: process.env.JWT_SECRET! })
app.get('/me', { preHandler: [app.authenticate] }, async (req) => req.user)`}</pre>

      <h2>Rate limit</h2>
      <pre>{`import { rateLimit } from '@neurova/backend/rate-limit'

app.addHook('onRequest', rateLimit({ windowMs: 60_000, max: 100 }))`}</pre>

      <h2>Cache</h2>
      <pre>{`import { createMemoryCache } from '@neurova/backend/cache'

const cache = createMemoryCache({ ttlMs: 60_000 })
await cache.set('k', 'v')
await cache.get('k')`}</pre>

      <h2>Queue</h2>
      <pre>{`import { Queue } from '@neurova/backend/queue'

const q = new Queue<{ to: string }>({ concurrency: 4, maxAttempts: 3 })
q.process(async (job) => { await sendEmail(job.to) })
await q.add({ to: 'a@b.c' })`}</pre>

      <h2>WebSockets</h2>
      <pre>{`import { SocketHub } from '@neurova/backend/socket'

const hub = new SocketHub({ server: app.server, path: '/ws' })
hub.on('message', ({ client, data }) => hub.broadcast(data))`}</pre>
    </article>
  )
}
