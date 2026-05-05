export default function Page() {
  return (
    <article>
      <h1>@neurova/testing</h1>
      <pre>{`import { mockChat, mockEmbed, collectStream } from '@neurova/testing'
import { chat, chatStream } from '@neurova/ai'

const provider = mockChat({ replies: ['hello', 'world'] })
const r = await chat(provider, { messages: [{ role: 'user', content: 'hi' }] })
expect(r.text).toBe('hello')

const text = await collectStream(chatStream(provider, { messages: [...] }))`}</pre>
    </article>
  )
}
