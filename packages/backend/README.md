# @neurova/backend

Fastify-powered server kit with batteries: cors, helmet, jwt auth, in-process queue, socket hub, rate limiting, and a swappable cache.

```ts
import { createServer, startServer, registerAuth, rateLimit } from '@neurova/backend'

const app = await createServer()
await registerAuth(app, { secret: process.env.JWT_SECRET! })
await app.register(rateLimit({ max: 60 }))
app.get('/me', { preHandler: app.authenticate }, async (req) => req.user)
await startServer(app, 3000)
```
