# neurova.js

**A unified TypeScript-first stack for modern applications — UI, Backend, and AI in one ecosystem.**

`neurova.js` is a monorepo of interoperable packages designed to help teams build full-stack products faster with consistent APIs, shared primitives, and zero-config developer ergonomics.

## Why neurova.js

- **One ecosystem, three layers:** UI components, backend tooling, and AI capabilities.
- **TypeScript-first by design:** End-to-end type safety across packages.
- **Composable architecture:** Use only the packages you need, or adopt the full stack.
- **Built for modern workflows:** Monorepo-friendly, testable, and production-focused.

## Get started

```bash
npm create neurova@latest my-app
```

## Package overview

| Package | Description |
|---|---|
| [`neurova`](./packages/neurova) | Meta-package re-exporting `ui`, `backend`, and `ai` |
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

## Quick usage

```ts
import { chat } from '@neurova/ai'
import { createServer } from '@neurova/backend'
import { Button, ChatWindow } from '@neurova/ui'
```

## Documentation

- **Full API reference:** [`DOCUMENTATION.md`](./DOCUMENTATION.md)
- Package-level docs are available in each package directory under `packages/*/README.md`.

## Development

From the repository root:

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
```

## License

Released under the [MIT License](./LICENSE).

## Copyright

© 2026 **@analyticswithharry** and **Squid Consultancy Group Ltd**.
