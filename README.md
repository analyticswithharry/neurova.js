# neurova.js

<p align="left">
	<a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-green.svg" /></a>
	<img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-First-3178C6?logo=typescript&logoColor=white" />
	<img alt="Monorepo" src="https://img.shields.io/badge/Monorepo-Turborepo-EF4444" />
	<img alt="Package Manager" src="https://img.shields.io/badge/Package_Manager-pnpm-F69220?logo=pnpm&logoColor=white" />
</p>

**A unified UI + Backend + AI framework for modern web apps.**

Build full-stack TypeScript products from one cohesive ecosystem instead of stitching together disconnected tools.

---

## Table of Contents

- [Why neurova.js](#why-neurovajs)
- [Quick Start](#quick-start)
- [Package Catalog](#package-catalog)
- [Architecture at a Glance](#architecture-at-a-glance)
- [Documentation](#documentation)
- [Development](#development)
- [Contributing](#contributing)
- [Security](#security)
- [License](#license)

## Why neurova.js

`neurova.js` is designed for teams shipping real products fast.

- **One install. Three layers.** UI components, backend services, and AI tooling in one stack.
- **Type-safe end to end.** Shared primitives and APIs across the entire monorepo.
- **Composable by default.** Adopt one package or the whole platform.
- **Production-minded.** SSR-safe UI, backend utilities, AI capabilities, and testing support.

## Quick Start

Create a new project:

```bash
npm create neurova@latest my-app
```

Example imports:

```ts
import { chat } from '@neurova/ai'
import { createServer } from '@neurova/backend'
import { Button, ChatWindow } from '@neurova/ui'
```

## Package Catalog

| Package | Description |
|---|---|
| [`neurova`](./packages/neurova) | Meta-package re-exporting `ui`, `backend`, and `ai` |
| [`@neurova/core`](./packages/core) | Shared primitives: errors, logger, schema, ids, events |
| [`@neurova/ui`](./packages/ui) | React 19 component library, SSR-safe |
| [`@neurova/backend`](./packages/backend) | Fastify-based server toolkit (db, auth, queue, sockets) |
| [`@neurova/ai`](./packages/ai) | LLM + embeddings + RAG + agents |
| [`@neurova/ai-core`](./packages/ai-core) | Tensor + autograd + nn + optim + losses (zero deps) |
| [`@neurova/ai-ml`](./packages/ai-ml) | Classical ML: KNN, Logistic, Linear, KMeans (`.train`/`.infer`) |
| [`@neurova/ai-vision`](./packages/ai-vision) | Image processing (BGR default), filters, dual ImageBitmap/sharp IO |
| [`@neurova/ai-data`](./packages/ai-data) | Built-in datasets (Iris, Fashion-MNIST) + CSV parser |
| [`@neurova/cli`](./packages/cli) | `neurova create | dev | build | deploy` |
| [`@neurova/icons`](./packages/icons) | Tree-shakeable SVG icon set |
| [`@neurova/themes`](./packages/themes) | Design tokens + presets |
| [`@neurova/testing`](./packages/testing) | Test utilities for UI, Backend, and AI layers |
| [`create-neurova`](./packages/create-neurova) | Official project scaffolder |

## Architecture at a Glance

The monorepo is organized for both framework development and real-world usage examples:

- `packages/*` → core framework packages
- `apps/*` → docs and playground applications
- `examples/*` → targeted integration examples
- `neurova-example/` → full sample app

## Documentation

- **Full API reference:** [`DOCUMENTATION.md`](./DOCUMENTATION.md)
- **Package docs:** each package includes its own `README.md` under [`packages/`](./packages)

## Development

From the repository root:

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
```

## Contributing

Contributions are welcome and appreciated.

- Open an issue for bug reports or feature requests.
- Keep changes scoped and include tests when applicable.
- For package-level details, check each package `README.md` before opening a PR.

## Security

If you discover a security issue, please report it privately to the maintainers instead of opening a public issue.

## License

Released under the [MIT License](./LICENSE).

---

© 2026 **@analyticswithharry** and **Squid Consultancy Group Ltd**.
