# neurova Stack Documentation

Welcome to the **neurova stack documentation portal**.

This folder is intentionally written as **multi-page Markdown** so it can be rendered by GitHub, static docs engines, or your own docs pipeline.

## Start here

1. [Getting Started](./getting-started.md)
2. [Architecture](./architecture.md)
3. [Build a Full Website (step-by-step)](./fullstack-website-guide.md)
4. [neurova-example Code Walkthrough](./neurova-example-walkthrough.md)

## Package guides

- [Meta package + versioning](./packages/01-meta-and-versioning.md)
- [Core primitives](./packages/02-core.md)
- [UI, runtime, themes, icons](./packages/03-ui-runtime-themes-icons.md)
- [Backend toolkit](./packages/04-backend.md)
- [AI stack (AI, AI Core, AI ML, AI Vision, AI Data)](./packages/05-ai-stack.md)
- [CLI, testing, scaffolding](./packages/06-cli-testing-scaffolding.md)
- [Published companion packages (`@neurova/compiler`, `@neurova/vite-plugin`)](./packages/07-companion-packages.md)

## What this documentation covers

- How to install and structure projects with neurova
- How each package is intended to be used
- How the included example (`neurova-example/`) is built, file by file
- How to design a production-ready full-stack site with this stack

## Scope notes

- This guide is based on the current monorepo source and package exports.
- `@neurova/compiler` and `@neurova/vite-plugin` are documented as **published companions** and not part of the local `packages/` folder in this workspace snapshot.
