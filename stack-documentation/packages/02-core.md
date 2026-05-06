# `@neurova/core`

Shared primitives used across UI, backend, and AI layers.

## What it provides

- Typed errors (`ValidationError`, `NotFoundError`, etc.)
- Logger helpers
- ID generators
- Schema parse wrappers
- Result pattern (`Ok`, `Err`)
- Event bus

## Example

```ts
import { ValidationError, logger, id, EventBus } from '@neurova/core'

logger.info('request received', { requestId: id('req') })

const bus = new EventBus<{ userCreated: { userId: string } }>()
bus.on('userCreated', (e) => logger.info('new user', e))
```

## When to use

Always. This package gives your stack shared language for errors, logging, validation, and events.
