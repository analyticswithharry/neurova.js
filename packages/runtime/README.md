# @neurova/runtime

Fine-grained reactive runtime + tiny DOM renderer for the neurova framework.
Original implementation, zero dependencies.

```ts
import { signal, effect, h, mount } from '@neurova/runtime'

const [count, setCount] = signal(0)
const app = () =>
  h('button', { 'on:click': () => setCount((c) => c + 1) },
    () => `clicked ${count()} times`)

mount(app, document.body)
```

© @analyticswithharry and Squid Consultancy Group Ltd. MIT.
