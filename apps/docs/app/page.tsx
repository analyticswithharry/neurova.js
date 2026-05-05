import Link from 'next/link'

export default function Home() {
  return (
    <>
      <section className="nv-hero">
        <h1>neurova</h1>
        <p>
          The powerful TypeScript framework for AI-native apps. UI components, backend server, and
          AI runtime — all in one install.
        </p>
        <div className="nv-cta">
          <Link className="nv-btn" href="/docs/getting-started">
            Get started
          </Link>
          <Link className="nv-btn secondary" href="/examples">
            See examples
          </Link>
        </div>
      </section>

      <section>
        <h2>One install. Everything you need.</h2>
        <pre>{'npm install neurova'}</pre>
        <pre>{`import { ai, backend, core } from 'neurova'
import { Button, ChatWindow } from 'neurova/ui'

const app = await backend.createServer()
app.post('/chat', async (req) => {
  const { message } = req.body
  return { reply: (await ai.chat(provider, { messages: [{ role: 'user', content: message }] })).text }
})`}</pre>

        <div className="nv-grid">
          <div className="nv-card">
            <h3>@neurova/core</h3>
            <p>Errors, logger, schema, IDs, events, Result type. Zero deps beyond ulid + zod.</p>
            <Link href="/docs/core">Read →</Link>
          </div>
          <div className="nv-card">
            <h3>@neurova/ui</h3>
            <p>Production-ready React components: Button, Form, ChatWindow, StreamRenderer.</p>
            <Link href="/docs/ui">Read →</Link>
          </div>
          <div className="nv-card">
            <h3>@neurova/backend</h3>
            <p>Fastify server with auth, rate-limit, cache, queue, and websockets.</p>
            <Link href="/docs/backend">Read →</Link>
          </div>
          <div className="nv-card">
            <h3>@neurova/ai</h3>
            <p>Chat, embeddings, vectors, RAG, and tool-using agents. Provider-agnostic.</p>
            <Link href="/docs/ai">Read →</Link>
          </div>
        </div>
      </section>
    </>
  )
}
