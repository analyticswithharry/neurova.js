import React from 'react'
import { createRoot } from 'react-dom/client'
import '@neurova/themes/light.css'
import '@neurova/ui/styles.css'
import { IconBrain, IconSpark } from '@neurova/icons'
import { Button, Card, ChatWindow, ThemeProvider, useTheme } from '@neurova/ui'
import type { ChatMessage } from '@neurova/ui'

function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  return (
    <Button variant="ghost" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      {theme === 'light' ? 'Dark' : 'Light'} mode
    </Button>
  )
}

function App() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Welcome to your neurova dashboard.' },
  ])
  const [pending, setPending] = React.useState(false)

  const onSend = async (text: string) => {
    const next: ChatMessage[] = [
      ...messages,
      { id: String(Date.now()), role: 'user', content: text },
    ]
    setMessages(next)
    setPending(true)
    await new Promise((r) => setTimeout(r, 400))
    setMessages([
      ...next,
      { id: String(Date.now() + 1), role: 'assistant', content: `echo: ${text}` },
    ])
    setPending(false)
  }

  return (
    <ThemeProvider>
      <div style={{ maxWidth: 960, margin: '40px auto', padding: 16, display: 'grid', gap: 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <IconBrain /> neurova dashboard
          </h1>
          <ThemeToggle />
        </header>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Card title="Today">
            <p>Active users: 1,204</p>
            <p>Tokens spent: 38,421</p>
            <Button leftIcon={<IconSpark />}>Generate report</Button>
          </Card>
          <Card title="Health">
            <p>API latency: 122ms</p>
            <p>Error rate: 0.2%</p>
          </Card>
        </div>
        <Card title="Assistant">
          <ChatWindow messages={messages} onSend={onSend} pending={pending} />
        </Card>
      </div>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
