import type { HTMLAttributes } from 'react'
import { cx } from '../utils/cx'

export interface ModelOutputProps extends HTMLAttributes<HTMLDivElement> {
  text: string
  /** When true, displays a blinking caret to indicate streaming. */
  streaming?: boolean
}

/** Render plain text from an LLM with optional streaming caret. */
export function ModelOutput({ text, streaming, className, ...rest }: ModelOutputProps) {
  return (
    <div data-nv-component="model-output" className={cx('nv-model-output', className)} {...rest}>
      {text}
      {streaming ? <span className="nv-caret" aria-hidden /> : null}
    </div>
  )
}
