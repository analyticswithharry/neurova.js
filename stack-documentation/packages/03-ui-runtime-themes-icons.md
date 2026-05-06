# UI Stack: `@neurova/ui`, `@neurova/runtime`, `@neurova/themes`, `@neurova/icons`

## `@neurova/ui`

React 19 component library with SSR-safe, accessible primitives.

Typical components in your example:
- `Button`
- `Card`
- `Input`
- `Spinner`
- `ChatWindow`
- `ThemeProvider` + `useTheme`

## `@neurova/runtime`

Reactive helpers for app state and UI logic.

Common APIs:
- `createStore`
- `useStore`
- `useSignal`
- `useComputed`
- `useEvent`

## `@neurova/themes`

Design tokens and theme presets, used for consistency and fast brand switching.

## `@neurova/icons`

Tree-shakeable SVG icon package.

## Example pattern

```tsx
import { ThemeProvider, Button } from '@neurova/ui'
import { createStore, useStore } from '@neurova/runtime'

const store = createStore({ count: 0 })

function Counter() {
  const count = useStore(store, (s) => s.count)
  return <Button onClick={() => store.setState((s) => ({ count: s.count + 1 }))}>Count: {count}</Button>
}

export function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <Counter />
    </ThemeProvider>
  )
}
```
