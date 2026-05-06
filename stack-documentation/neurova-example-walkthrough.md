# `neurova-example` Code Walkthrough

This page explains **how the example is written** and **how to reuse each pattern** in your own products.

## Folder map

```text
neurova-example/
  src/
    App.tsx        # complete page logic + feature composition
    main.tsx       # app bootstrap
    styles.css     # visual system and component-level CSS
  vite.config.ts   # Vite setup
  package.json     # scripts + dependencies
```

## `src/main.tsx` — app bootstrap

- Imports global UI styles from `@neurova/ui/styles.css`
- Renders `<App />` into `#app`
- Uses React 19 + StrictMode

Use this same pattern for every frontend app entry point.

## `src/App.tsx` — full product composition

The example demonstrates these practical patterns:

1. **State management with `@neurova/runtime`**
   - `createStore` for cart state
   - `useStore` for derived values
   - `useSignal` for local reactive state
2. **UI composition with `@neurova/ui`**
   - `Button`, `Card`, `Input`, `Spinner`, `ChatWindow`, `ThemeProvider`
3. **Theming with `@neurova/themes`**
   - switch themes dynamically using preset names
4. **AI embedding workflow with `@neurova/ai`**
   - `providers.echo()` + `cosineSimilarity` for recommendations
5. **External model routing (HF endpoint)**
   - persona-based assistant UX via chat completions
6. **Hash-based multi-page navigation**
   - Home / Menu / Roastery route states

## `src/styles.css` — design system in plain CSS

- Defines CSS variables (`--bg`, `--brand`, `--accent`) as theme tokens
- Uses responsive grid sections and reusable visual primitives
- Adds overrides for UI package variables for brand customization

How to reuse:
- Keep color + spacing tokens at the top
- Build section-level components with utility-like class naming
- Keep package overrides grouped and documented

## `vite.config.ts`

Simple React + Vite config with dev server settings. Good baseline for package demos.

## Adapting this example for production

- Move hardcoded catalog data to API/database
- Replace local token handling with secure backend proxy
- Persist cart and profile state server-side
- Add route-based code splitting
- Add CI tests for components and flows
