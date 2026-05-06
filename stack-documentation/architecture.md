# neurova Architecture

## The 3-layer model

neurova is designed around three coordinated layers:

1. **UI Layer** — `@neurova/ui`, `@neurova/runtime`, `@neurova/themes`, `@neurova/icons`
2. **Backend Layer** — `@neurova/backend`, `@neurova/core`
3. **AI Layer** — `@neurova/ai`, `@neurova/ai-core`, `@neurova/ai-ml`, `@neurova/ai-vision`, `@neurova/ai-data`

## Cross-cutting packages

- `@neurova/core` provides shared primitives used by all layers.
- `@neurova/testing` provides test helpers and mocks.
- `@neurova/cli` and `create-neurova` accelerate project setup.
- `neurova` re-exports major packages for convenience.

## Request/data flow (typical full-stack app)

```text
Browser UI (@neurova/ui + @neurova/runtime)
        ↓
Frontend app (React/Vite/Next)
        ↓ HTTP/WebSocket
API server (Fastify + @neurova/backend)
        ↓
AI provider adapters (@neurova/ai/providers)
        ↓
Vector/RAG/Tools (same @neurova/ai layer)
```

## Why this split works

- Better separation of concerns
- Better testing boundaries
- Faster onboarding for teams (clear package intent)
- Easier versioned publishing per package
