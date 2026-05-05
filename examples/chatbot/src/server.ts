import { createServer, startServer } from '@neurova/backend'
import { chat, chatStream } from '@neurova/ai'
import { echo, openAI } from '@neurova/ai/providers'

const provider = process.env.OPENAI_API_KEY ? openAI({ apiKey: process.env.OPENAI_API_KEY }) : echo()

const app = await createServer()

app.post('/chat', async (req) => {
  const { message } = req.body as { message: string }
  const r = await chat(provider, { messages: [{ role: 'user', content: message }] })
  return { reply: r.text }
})

app.post('/stream', async (req, reply) => {
  const { message } = req.body as { message: string }
  reply.raw.setHeader('Content-Type', 'text/event-stream')
  reply.raw.setHeader('Cache-Control', 'no-cache')
  for await (const delta of chatStream(provider, { messages: [{ role: 'user', content: message }] })) {
    reply.raw.write(`data: ${JSON.stringify({ delta })}\n\n`)
  }
  reply.raw.write('data: [DONE]\n\n')
  reply.raw.end()
})

await startServer(app, 3001)
console.log('chatbot on http://localhost:3001')
