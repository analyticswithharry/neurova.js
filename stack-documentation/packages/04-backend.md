# `@neurova/backend`

Fastify-based backend toolkit with batteries included.

## Modules exposed

- `server`
- `auth`
- `cache`
- `queue`
- `socket`
- `rate-limit`

## Base server

```ts
import { createServer, startServer } from '@neurova/backend'

const app = await createServer({ logger: true })
app.get('/health', async () => ({ ok: true }))
await startServer(app, { port: 3000 })
```

## Typical production composition

1. Register auth plugin/JWT
2. Add cache for expensive operations
3. Add queue for background jobs
4. Add websocket for live UX
5. Add rate limiting and request validation
