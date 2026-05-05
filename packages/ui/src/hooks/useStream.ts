import { useEffect, useState } from 'react'

/** Subscribe to an async-iterable text stream and return accumulated text. */
export function useStream(stream: AsyncIterable<string> | null) {
  const [text, setText] = useState('')
  const [done, setDone] = useState(false)
  useEffect(() => {
    if (!stream) return
    let cancelled = false
    let acc = ''
    setText('')
    setDone(false)
    ;(async () => {
      for await (const chunk of stream) {
        if (cancelled) return
        acc += chunk
        setText(acc)
      }
      if (!cancelled) setDone(true)
    })().catch(() => {})
    return () => {
      cancelled = true
    }
  }, [stream])
  return { text, done }
}
