# neurova-example

A small landing page that consumes the **neurova.js** packages from npm.

## Learn the full stack

For the full multi-page guide (architecture, package docs, and full website build tutorial), see:

- [`../stack-documentation/index.md`](../stack-documentation/index.md)

## Install & run

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in ./dist
npm run preview  # serve the build
```

## What it shows

- `@neurova/runtime` — fine-grained signals + DOM renderer (no virtual DOM)
- `@neurova/compiler` — `.nv` single-file component DSL
- `@neurova/vite-plugin` — Vite integration that compiles `.nv` on the fly

The page itself (`src/App.nv`) is a single `.nv` component that composes
`Counter.nv` and `Greeter.nv`, demonstrates a reactive list via the
runtime's `For` helper, and links out to the published packages on npm.
