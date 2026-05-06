# Published Companion Packages

These are part of your published ecosystem and frequently used with `neurova-example` style workflows.

## `@neurova/compiler`

Purpose:
- Parses `.nv` single-file components
- Emits JavaScript for either `@neurova/runtime` or React targets

Use cases:
- custom SFC authoring workflow
- design-system style component authoring

## `@neurova/vite-plugin`

Purpose:
- Vite plugin that transforms `.nv` files through `@neurova/compiler`

Use cases:
- local dev with hot reload for `.nv` components
- compile-time transformation in Vite-based apps

## Suggested setup shape

```ts
// vite.config.ts
import { defineConfig } from 'vite'
// import neurovaPlugin from '@neurova/vite-plugin'

export default defineConfig({
  plugins: [
    // neurovaPlugin(),
  ],
})
```

> Note: In this workspace snapshot, these two packages are treated as published companions and are not present under the local `packages/` folder.
