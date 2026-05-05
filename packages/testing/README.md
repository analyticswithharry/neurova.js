# @neurova/testing

Mock providers and helpers for unit-testing neurova apps.

```ts
import { mockChat, mockEmbed, collectStream } from '@neurova/testing'
import { chat } from '@neurova/ai'

const provider = mockChat({ replies: ['hello', 'world'] })
const r = await chat(provider, { messages: [{ role: 'user', content: 'hi' }] })
expect(r.text).toBe('hello')
expect(provider.calls).toHaveLength(1)
```
