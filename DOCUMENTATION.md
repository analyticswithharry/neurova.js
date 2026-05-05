# neurova.js — API Documentation

Brief reference for every public function, class, and feature across all `@neurova/*` packages.

> Install everything: `pnpm add neurova` — or per-package: `pnpm add @neurova/ai @neurova/ui ...`

---

## `@neurova/core`

Foundational primitives: errors, logging, IDs, schemas, results, events.

### Errors
```ts
import { NeurovaError, ValidationError, NotFoundError, isNeurovaError } from '@neurova/core'

throw new ValidationError('email required', { field: 'email' })
if (isNeurovaError(err)) console.log(err.code, err.statusCode)
```
Available: `NeurovaError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, `RateLimitError`, `TimeoutError`.

### Logger
```ts
import { logger, createLogger } from '@neurova/core'
logger.info('server up', { port: 3000 })
const child = createLogger({ name: 'worker', level: 'debug' })
```
Levels: `trace | debug | info | warn | error | fatal`.

### IDs
```ts
import { id, uuid, shortId } from '@neurova/core'
id('user')      // 'user_aB3...'
uuid()          // RFC4122 v4
shortId(8)      // 8-char nanoid
```

### Schema (Zod wrapper)
```ts
import { parse, safeParse } from '@neurova/core'
import { z } from 'zod'
const User = z.object({ name: z.string() })
parse(User, data)         // throws ValidationError
safeParse(User, data)     // Result<T, ValidationError>
```

### Result
```ts
import { Ok, Err, tryCatch, tryCatchAsync, unwrap } from '@neurova/core'
const r = tryCatch(() => JSON.parse(s))
if (r.ok) use(r.value)
```

### EventBus
```ts
import { EventBus } from '@neurova/core'
const bus = new EventBus<{ login: { userId: string } }>()
bus.on('login', (p) => console.log(p.userId))
bus.emit('login', { userId: '1' })
```

---

## `@neurova/ai`

Unified chat, embeddings, vectors, RAG, agents, tracing — across providers.

### Chat
```ts
import { chat, chatStream } from '@neurova/ai'
import { openai } from '@neurova/ai/providers'

const res = await chat(openai({ apiKey, model: 'gpt-4o' }), {
  messages: [{ role: 'user', content: 'hello' }],
})

for await (const token of chatStream(provider, { messages })) process.stdout.write(token)
```

### Embeddings
```ts
import { embed, cosineSimilarity } from '@neurova/ai'
const { vectors } = await embed(provider, { input: ['hello', 'world'] })
const score = cosineSimilarity(vectors[0], vectors[1])
```

### Vector store
```ts
import { createMemoryVectorStore } from '@neurova/ai'
const store = createMemoryVectorStore<{ source: string }>()
await store.upsert([{ id: '1', vector: [...], metadata: { source: 'doc' } }])
const matches = await store.query({ vector: [...], topK: 5 })
```

### RAG
```ts
import { chunkText, buildIndex, retrieve, answer } from '@neurova/ai'
const chunks = chunkText(longText, { size: 500, overlap: 50 })
await buildIndex(docs, { store, embedder })
const hits = await retrieve({ query: 'what is X?', store, embedder, topK: 4 })
const reply = await answer({ query, store, embedder, chat: chatProvider })
```

### Agents (tools / function calling)
```ts
import { Agent } from '@neurova/ai'
const agent = new Agent({
  chat: provider,
  tools: [{ name: 'getWeather', description: '...', parameters: schema, execute: async (args) => {...} }],
})
const run = await agent.run('weather in Paris?')
```

### Tracing
```ts
import { createTracer, noopTracer } from '@neurova/ai'
const tracer = createTracer()
const span = tracer.start('chat')
span.end()
```

### Providers (`@neurova/ai/providers`)
- `openai({ apiKey, model })` — Chat + embeddings
- `anthropic({ apiKey, model })` — Claude chat
- `ollama({ baseUrl, model })` — Local models
- `echo()` — Returns input verbatim (testing/dev)

---

## `@neurova/ai-core`

Pure-TS tensor library with reverse-mode autograd, neural-net layers, optimizers, and losses. Zero dependencies.

```ts
import { Tensor } from '@neurova/ai-core'
import { Linear, ReLU, Sequential } from '@neurova/ai-core/nn'
import { Adam } from '@neurova/ai-core/optim'
import { mseLoss } from '@neurova/ai-core/losses'

const model = new Sequential(new Linear(4, 16), new ReLU(), new Linear(16, 1))
const opt = new Adam(model.parameters(), 0.01)
const x = Tensor.from([[1, 2, 3, 4]])
const y = Tensor.from([[1]])
const loss = mseLoss(model.forward(x), y)
loss.backward()
opt.step()
opt.zeroGrad()
```

- **Tensor**: `Tensor.from(data)`, `.add/.mul/.matmul/.relu/.sum/.mean`, NumPy broadcasting, `.backward()`.
- **nn**: `Module`, `Linear` (He init), `ReLU`, `Sigmoid`, `Tanh`, `Sequential`.
- **optim**: `SGD(params, lr, momentum?)`, `Adam(params, lr, betas?, eps?)`.
- **losses**: `mseLoss`, `bceLoss`, `crossEntropyLoss`.

---

## `@neurova/ai-ml`

Classical machine-learning learners with the `BaseLearner` ABC (`.train()` / `.infer()` — matches the Python `nalyst` API, not `fit/predict`).

```ts
import { KNearestNeighbors, LogisticLearner, LinearRegression, KMeans } from '@neurova/ai-ml'
import { trainTestSplit, accuracyScore, meanSquaredError } from '@neurova/ai-ml'

const knn = new KNearestNeighbors(3)
knn.train(XTrain, yTrain)
const preds = knn.infer(XTest)
accuracyScore(yTest, preds)
```

- **Base**: `BaseLearner` (abstract), `duplicate(learner)`, types `Matrix = number[][]`, `Vector = number[]`.
- **Supervised**: `KNearestNeighbors(k, metric?)`, `LogisticLearner(lr, epochs)`, `LinearRegression()` (OLS).
- **Unsupervised**: `KMeans(k, maxIter?)`.
- **Evaluation**: `trainTestSplit(X, y, testSize, seed?)`, `accuracyScore`, `meanSquaredError`.
- Every learner: `.train(X, y)`, `.infer(X)`, `.getParams()`, `.setParams(p)`, `.duplicate()`.

---

## `@neurova/ai-vision`

Image processing primitives. **BGR is the default channel order** (OpenCV-compatible). Dual IO: browser (`ImageBitmap`) and Node (`sharp` peer dep).

```ts
import { Image, toGrayscale, gaussianBlur, resize, threshold } from '@neurova/ai-vision'
import { readImage } from '@neurova/ai-vision/io-node'   // or '/io-browser'

const img = await readImage('photo.jpg')        // BGR by default
const gray = toGrayscale(img)                    // BT.601
const blurred = gaussianBlur(gray, 1.5)
const small = resize(blurred, 64, 64)
const mask = threshold(small, 128)
```

- **Image**: `new Image(w, h, data, colorOrder?)`, `colorOrder ∈ 'BGR'|'RGB'|'GRAY'|'BGRA'|'RGBA'`, `.pixel/.setPixel/.clone()`.
- **color**: `toGrayscale(img)`, `swapChannels(img)` (BGR↔RGB, BGRA↔RGBA).
- **filters**: `boxBlur(img, size=3)`, `gaussianBlur(img, sigma, size?)`, `threshold(img, t)`.
- **transform**: `resize(img, w, h)` (nearest), `flipHorizontal`, `flipVertical`.
- **io**: `readImage(source)` from `/io-browser` (fetch + `OffscreenCanvas`) or `/io-node` (`sharp`).

---

## `@neurova/ai-data`

Built-in datasets and a CSV parser. Iris is inlined (no network); Fashion-MNIST streams gzipped IDX files via `fetch` + `DecompressionStream`.

```ts
import { loadIris, loadFashionMnist, parseCsv, asMatrix, row } from '@neurova/ai-data'
import { KNearestNeighbors, trainTestSplit, accuracyScore } from '@neurova/ai-ml'

const iris = loadIris()                       // 150 × 4, 3 classes
const X = asMatrix(iris)
const y = Array.from(iris.target)
const { XTrain, XTest, yTrain, yTest } = trainTestSplit(X, y, 0.2, 42)
const knn = new KNearestNeighbors(3).train(XTrain, yTrain)
console.log(accuracyScore(yTest, knn.infer(XTest)))

const fm = await loadFashionMnist({ subset: 'test' })   // 10k × 784
const { header, rows } = parseCsv(csvText)
```

- **Dataset shape**: `{ data: Float32Array, target: Float32Array, nSamples, nFeatures, featureNames, targetNames?, description }`.
- **Loaders**: `loadIris()`, `loadFashionMnist({ subset, baseUrl? })`.
- **CSV**: `parseCsv(text, { header?, delimiter? })` — handles quotes, escapes, CRLF.
- **Helpers**: `row(d, i)`, `asMatrix(d)` (bridges to `@neurova/ai-ml`).

---

## `@neurova/backend`

Fastify-based server toolkit: auth, cache, queues, sockets, rate limiting.

### Server
```ts
import { createServer, startServer } from '@neurova/backend'
const app = await createServer({ logger: true })
app.get('/health', async () => ({ ok: true }))
await startServer(app, { port: 3000 })
```

### Auth (JWT)
```ts
import { registerAuth } from '@neurova/backend'
await registerAuth(app, { secret: process.env.JWT_SECRET })

// In a route:
const token = await reply.jwtSign({ sub: userId }, { expiresIn: '1h' })
await req.jwtVerify()
```

### Cache
```ts
import { createMemoryCache, createRedisCache } from '@neurova/backend'
const cache = createMemoryCache()
await cache.set('key', value, { ttl: 60 })
await cache.get('key')

// Or Redis-compatible client:
const cache = createRedisCache(redisClient)
```

### Queue
```ts
import { Queue } from '@neurova/backend'
const q = new Queue<{ email: string }>({ concurrency: 4 })
q.process(async (job) => sendEmail(job.email))
await q.add({ email: 'x@y.z' })
```

### Sockets
```ts
import { SocketHub } from '@neurova/backend'
const hub = new SocketHub<{ chat: { text: string } }>({ app })
hub.on('chat', (client, payload) => hub.broadcast('chat', payload))
```

### Rate limit
```ts
import { rateLimit } from '@neurova/backend'
app.addHook('onRequest', rateLimit({ max: 100, windowMs: 60_000 }))
```

---

## `@neurova/ui`

React components + hooks. Tree-shakable, themeable via CSS variables.

### Components
| Component | Purpose |
|---|---|
| `Button` | Primary action, supports `variant`, `size`, `leftIcon`, `rightIcon`, `loading` |
| `Input` | Text input with `label`, `error`, `hint` |
| `Card` | Container with `title`, `footer` |
| `Modal` | Accessible dialog with `open`, `onClose` |
| `Form` | Validated form wrapper (zod-aware) |
| `Spinner` | Loading indicator |
| `CodeBlock` | Syntax-highlighted code, accepts `code` prop or children |
| `ChatWindow` | Full chat UI with messages + input |
| `ModelOutput` | Render a model response |
| `StreamRenderer` | Token-by-token rendering for streamed text |
| `ThemeProvider` | Wraps app, provides `light`/`dark` theme + tokens |

```tsx
import { ThemeProvider, Button, ChatWindow } from '@neurova/ui'
<ThemeProvider theme="dark">
  <Button variant="primary" leftIcon={<Icon />}>Send</Button>
</ThemeProvider>
```

### Hooks
```ts
import { useDebounce, useMediaQuery, useStream, useTheme } from '@neurova/ui'

const debounced = useDebounce(value, 250)
const isMobile = useMediaQuery('(max-width: 640px)')
const { text, done } = useStream(asyncIterable)
const { theme, setTheme } = useTheme()
```

---

## `@neurova/themes`

Design tokens + theme presets shared by `@neurova/ui`.

```ts
import { tokens, themePresets, type Theme } from '@neurova/themes'
tokens.color.primary        // 'var(--nv-color-primary)'
tokens.space(2)             // 'calc(2 * var(--nv-space-unit))'
themePresets.dark           // CSS variable map
```

---

## `@neurova/icons`

Tree-shakable React icon set.
```tsx
import { ChatIcon, SparkleIcon } from '@neurova/icons'
<ChatIcon size={20} />
```

---

## `@neurova/testing`

Mock providers for unit testing AI code without network calls.

```ts
import { mockChat, mockEmbed } from '@neurova/testing'

const provider = mockChat({ replies: ['hi', 'how can I help?'] })
await chat(provider, { messages: [...] })
expect(provider.calls).toHaveLength(1)

const embedder = mockEmbed({ dim: 64 })  // deterministic vectors
```

---

## `@neurova/cli`

Project scaffolding and dev utilities.

```bash
npx @neurova/cli init my-app          # scaffold a new app
npx @neurova/cli add ui               # add @neurova/ui to current project
npx @neurova/cli dev                  # run dev server with hot reload
```

---

## `create-neurova`

Wrapper so users can scaffold via the standard `npm create` syntax:
```bash
npm create neurova@latest my-app
pnpm create neurova my-app
```
Forwards to `@neurova/cli init`.

---

## `neurova` (umbrella)

Single-install meta-package re-exporting everything under namespaces.
```ts
import { ai, backend, core } from 'neurova'
const reply = await ai.chat(provider, { messages })
const app = await backend.createServer()
core.logger.info('ready')
```
For tree-shaking, prefer subpath imports:
```ts
import { chat } from 'neurova/ai'
import { Button } from 'neurova/ui'
```

---

## Quick recipe: chat + RAG + UI in 20 lines

```tsx
import { openai } from '@neurova/ai/providers'
import { chunkText, buildIndex, answer, createMemoryVectorStore } from '@neurova/ai'
import { ChatWindow, ThemeProvider } from '@neurova/ui'

const provider = openai({ apiKey: process.env.OPENAI_API_KEY!, model: 'gpt-4o' })
const store = createMemoryVectorStore()
await buildIndex(
  [{ id: 'doc1', text: longArticle }],
  { store, embedder: provider, size: 500 },
)

export default function App() {
  return (
    <ThemeProvider theme="dark">
      <ChatWindow onSend={async (q) => answer({ query: q, store, embedder: provider, chat: provider })} />
    </ThemeProvider>
  )
}
```

---

© @analyticswithharry and Squid Consultancy Group Ltd
