# Tooling Stack: `@neurova/cli`, `@neurova/testing`, `create-neurova`

## `@neurova/cli`

Command-line entry point for project workflows.

Documented command shape in source:

- `neurova init <name>`
- `neurova info`
- `neurova help`

## `create-neurova`

The `npm create neurova@latest` experience.

Internally it forwards to `@neurova/cli init ...` for app scaffolding.

## `@neurova/testing`

Testing utilities and mock providers for neurova applications.

Recommended usage:
- Mock provider adapters for deterministic AI tests
- Reusable helper factories for UI/backend integration tests

## Suggested CI commands

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
