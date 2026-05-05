# @neurova/core

Shared primitives for the neurova ecosystem.

```ts
import { NeurovaError, createLogger, parse, z, id, EventBus, Ok, Err } from '@neurova/core'
```

- **errors** — `NeurovaError`, `ValidationError`, `NotFoundError`, ...
- **logger** — pretty TTY logger, JSON in production
- **schema** — `z` (zod) re-export + `parse` / `safeParse`
- **id** — `id()` (ULID), `uuid()`, `shortId()`
- **events** — typed `EventBus`
- **result** — `Result<T, E>`, `Ok`, `Err`, `tryCatch`

© 2026 @analyticswithharry · Squid Consultancy Group Ltd · MIT
