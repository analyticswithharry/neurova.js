import { useEffect, useState } from 'react'
import { ModelOutput } from './ModelOutput'

export interface StreamRendererProps {
  /** Async iterable of string deltas (e.g. an LLM token stream). */
  stream: AsyncIterable<string>
  onDone?: (full: string) => void
  className?: string
}

/** Consumes an async iterable of text deltas and renders incrementally. */
export function StreamRenderer({ stream, onDone, className }: StreamRendererProps) {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    let cancelled = false
    let acc = ''
    ;(async () => {
      for await (const chunk of stream) {
        if (cancelled) return
        acc += chunk
        setText(acc)
      }
      if (!cancelled) {
        setDone(true)
        onDone?.(acc)
      }
    })().catch(() => {})
    return () => {
      cancelled = true
    }
  }, [stream, onDone])

  return <ModelOutput text={text} streaming={!done} className={className} />
}
