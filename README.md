# neurova.js

> A unified **UI + Backend + AI** library for the modern web.
> One install. Three layers. TypeScript-first. Zero-config.

```bash
npm create neurova@latest my-app
```

## Packages

| Package | Description |
|---|---|
| [`neurova`](./packages/neurova) | Meta-package re-exporting `ui`, `backend`, `ai` |
| [`@neurova/core`](./packages/core) | Shared primitives: errors, logger, schema, ids, events |
| [`@neurova/ui`](./packages/ui) | React 19 component library, SSR-safe |
| [`@neurova/backend`](./packages/backend) | Fastify-based server toolkit (db, auth, queue, sockets) |
| [`@neurova/ai`](./packages/ai) | LLM + embeddings + RAG + agents |
| [`@neurova/ai-core`](./packages/ai-core) | Tensor + autograd + nn + optim + losses (zero deps) |
| [`@neurova/ai-ml`](./packages/ai-ml) | Classical ML: KNN, Logistic, Linear, KMeans (`.train`/`.infer`) |
| [`@neurova/ai-vision`](./packages/ai-vision) | Image (BGR default), filters, dual ImageBitmap/sharp IO |
| [`@neurova/ai-data`](./packages/ai-data) | Built-in datasets (Iris, Fashion-MNIST) + CSV parser |
| [`@neurova/cli`](./packages/cli) | `neurova create | dev | build | deploy` |
| [`@neurova/icons`](./packages/icons) | Tree-shakeable SVG icon set |
| [`@neurova/themes`](./packages/themes) | Design tokens + presets |
| [`@neurova/testing`](./packages/testing) | Test utilities for all three layers |
| [`create-neurova`](./packages/create-neurova) | Project scaffolder |

## Quick start

```ts
import { chat } from '@neurova/ai'
import { createServer } from '@neurova/backend'
import { Button, ChatWindow } from '@neurova/ui'
```

📖 **Full API reference:** [DOCUMENTATION.md](./DOCUMENTATION.md) — every function, hook, and component with one-line usage examples.

## Develop

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
```

## Copyright

© 2026 **@analyticswithharry** and **Squid Consultancy Group Ltd**. Released under the [MIT License](./LICENSE).
