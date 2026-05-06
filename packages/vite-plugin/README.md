# @neurova/vite-plugin

Placeholder package for the neurova.js React + TypeScript stack.

In the current architecture there is no custom Vite transform — neurova ships as plain React + TS components. Use [`@neurova/runtime`](https://www.npmjs.com/package/@neurova/runtime) hooks directly inside any Vite + React project.

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

```tsx
import { useChat } from '@neurova/runtime'

export function Chat() {
  const { messages, send } = useChat()
  // ...
}
```

See [neurova.js](https://github.com/analyticswithharry/neurova.js) for the full stack.

© @analyticswithharry and Squid Consultancy Group Ltd. MIT.
