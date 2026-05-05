import { useState, type ReactNode } from 'react'
import { cx } from '../utils/cx'
import { Input } from './Input'
import { Button } from './Button'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatWindowProps {
  messages: ChatMessage[]
  onSend: (text: string) => void | Promise<void>
  placeholder?: string
  pending?: boolean
  className?: string
  emptyState?: ReactNode
}

export function ChatWindow({
  messages,
  onSend,
  placeholder = 'Type a message…',
  pending,
  className,
  emptyState,
}: ChatWindowProps) {
  const [text, setText] = useState('')
  const submit = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    setText('')
    await onSend(trimmed)
  }
  return (
    <div data-nv-component="chat-window" className={cx('nv-chat', className)}>
      <div className="nv-chat-list" role="log" aria-live="polite">
        {messages.length === 0 ? emptyState : null}
        {messages.map((m) => (
          <div key={m.id} className="nv-chat-msg" data-nv-role={m.role}>
            {m.content}
          </div>
        ))}
      </div>
      <form
        className="nv-chat-form"
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          disabled={pending}
          aria-label="Message"
        />
        <Button type="submit" loading={pending}>Send</Button>
      </form>
    </div>
  )
}
