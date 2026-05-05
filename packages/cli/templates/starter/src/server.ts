import { backend, ai } from 'neurova'
import { echo } from '@neurova/ai/providers'

const app = await backend.createServer()
const provider = echo()

app.post('/chat', async (req) => {
  const { message } = req.body as { message: string }
  const r = await ai.chat(provider, { messages: [{ role: 'user', content: message }] })
  return { reply: r.text }
})

await backend.startServer(app, 3000)
console.log('neurova app listening on http://localhost:3000')
