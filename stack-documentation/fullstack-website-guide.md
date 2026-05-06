# Build a Full-Fledged Website with neurova

This guide shows a practical architecture and implementation sequence for a production-grade web app.

## Step 1 — Plan features by layer

### UI
- Marketing pages
- Auth screens
- Dashboard
- Chat/search widgets

### Backend
- Auth + sessions
- CRUD APIs
- queue jobs
- websocket notifications

### AI
- chat assistant
- embeddings + semantic search
- RAG responses from docs

## Step 2 — Frontend foundation

Use `@neurova/ui` components and `@neurova/themes` presets for consistent UX.

```tsx
import { ThemeProvider, Button, Card } from '@neurova/ui'
import { themePresets } from '@neurova/themes'

export function AppShell() {
  return (
    <ThemeProvider defaultTheme="light">
      <Card title="Welcome">
        <Button variant="primary">Get started</Button>
      </Card>
    </ThemeProvider>
  )
}
```

Use `@neurova/runtime` for stateful reactivity where needed:

```ts
import { createStore, useStore } from '@neurova/runtime'

const sessionStore = createStore({ user: null as null | { id: string; name: string } })
const user = useStore(sessionStore, (s) => s.user)
```

## Step 3 — Backend foundation

Spin up Fastify with `@neurova/backend`:

```ts
import { createServer, startServer } from '@neurova/backend'

const app = await createServer({ logger: true })
app.get('/health', async () => ({ ok: true }))
await startServer(app, { port: 3000 })
```

Then layer in auth/cache/queue/socket/rate limit modules from the same package.

## Step 4 — AI features

Provider-agnostic chat + embeddings:

```ts
import { chat, embed, providers } from '@neurova/ai'

const provider = providers.openai({ apiKey: process.env.OPENAI_API_KEY!, model: 'gpt-4o-mini' })
const reply = await chat(provider, { messages: [{ role: 'user', content: 'Summarize my dashboard activity.' }] })
const vectors = await embed(provider, { input: ['invoice overdue', 'payment complete'] })
```

Add RAG and tools as your data footprint grows.

## Step 5 — Testing strategy

- Unit tests for package-level functions
- Integration tests for API routes and middleware
- UI interaction tests for critical flows
- AI tests with deterministic provider stubs (`providers.echo()`)

Use `@neurova/testing` where available for mocks and helpers.

## Step 6 — Production checklist

- Environment variables managed per deployment target
- Auth tokens and secrets rotated
- API rate limiting enabled
- Structured logs + tracing enabled
- CI pipeline runs typecheck/test/build

## Suggested rollout sequence

1. Frontend shell + theme system
2. Backend APIs + auth
3. AI assistant (chat only)
4. Embeddings + search
5. RAG + tools + observability
