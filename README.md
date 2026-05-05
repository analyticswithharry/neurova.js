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
| [`@neurova/ai`](./packages/ai) | LLM + embeddings + RAG + on-device ML |
| [`@neurova/cli`](./packages/cli) | `neurova create | dev | build | deploy` |
| [`@neurova/icons`](./packages/icons) | Tree-shakeable SVG icon set |
| [`@neurova/themes`](./packages/themes) | Design tokens + presets |
| [`@neurova/testing`](./packages/testing) | Test utilities for all three layers |
| [`create-neurova`](./packages/create-neurova) | Project scaffolder |

## Quick start

```ts
import { chat } from '@neurova/ai'
import { createServer, defineRoute } from '@neurova/backend'
import { Button, ChatWindow } from '@neurova/ui'
```

## Develop

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
```

## Copyright

© 2026 **@analyticswithharry** and **Squid Consultancy Group Ltd**. Released under the [MIT License](./LICENSE).
