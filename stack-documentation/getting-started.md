# Getting Started with neurova.js

## Prerequisites

- Node.js `>= 20.10.0`
- pnpm `>= 9`

## Create a new app

Use the scaffolder:

```bash
npm create neurova@latest my-app
```

This routes to `@neurova/cli init` through `create-neurova`.

## Install key packages directly

If you are composing manually:

```bash
pnpm add @neurova/ui @neurova/backend @neurova/ai @neurova/runtime @neurova/themes
```

Or use the umbrella package:

```bash
pnpm add neurova
```

## Minimal imports

```ts
import { Button } from '@neurova/ui'
import { createServer } from '@neurova/backend'
import { chat, providers } from '@neurova/ai'
```

## Local development (monorepo)

From repository root:

```bash
pnpm install
pnpm build
pnpm dev
pnpm test
```

## Recommended project layout (full product)

```text
my-product/
  apps/
    web/           # frontend app (React/Vite/Next)
    api/           # backend app (Fastify + @neurova/backend)
  packages/
    shared/        # shared DTOs/types/schemas
```
