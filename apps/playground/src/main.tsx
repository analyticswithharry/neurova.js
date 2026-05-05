import React from 'react'
import { createRoot } from 'react-dom/client'
import '@neurova/themes/light.css'
import '@neurova/ui/styles.css'
import {
  Button,
  Card,
  ChatWindow,
  CodeBlock,
  Input,
  Modal,
  Spinner,
  ThemeProvider,
  useTheme,
} from '@neurova/ui'
import type { ChatMessage } from '@neurova/ui'
import { IconBrain, IconSpark, IconBot } from '@neurova/icons'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card title={title}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>{children}</div>
    </Card>
  )
}

function Toggle() {
  const { theme, setTheme } = useTheme()
  return <Button variant="ghost" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>{theme}</Button>
}

function App() {
  const [open, setOpen] = React.useState(false)
  const [name, setName] = React.useState('')
  const [messages, setMessages] = React.useState<ChatMessage[]>([
    { id: '1', role: 'assistant', content: 'Try the components on the left.' },
  ])
  return (
    <ThemeProvider>
      <div style={{ maxWidth: 1080, margin: '32px auto', padding: 16, display: 'grid', gap: 16 }}>
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h1 style={{ margin: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
            <IconBrain /> neurova playground
          </h1>
          <Toggle />
        </header>

        <Section title="Buttons">
          <Button>Default</Button>
          <Button variant="primary" leftIcon={<IconSpark />}>Primary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button disabled>Disabled</Button>
        </Section>

        <Section title="Inputs">
          <Input placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
          <span>Hello {name || '…'}</span>
        </Section>

        <Section title="Modal">
          <Button onClick={() => setOpen(true)}>Open modal</Button>
          <Modal open={open} onClose={() => setOpen(false)} title="Hello">
            <p>This is a modal.</p>
          </Modal>
        </Section>

        <Section title="Spinner & icons">
          <Spinner /> <IconBot /> <IconSpark /> <IconBrain />
        </Section>

        <Section title="Code block">
          <CodeBlock language="ts">{`import { chat } from 'neurova/ai'`}</CodeBlock>
        </Section>

        <Card title="Chat">
          <ChatWindow
            messages={messages}
            onSend={(text) => {
              const next: ChatMessage[] = [...messages, { id: String(Date.now()), role: 'user', content: text }]
              setMessages([...next, { id: String(Date.now() + 1), role: 'assistant', content: `you said: ${text}` }])
            }}
          />
        </Card>
      </div>
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(<App />)
