import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../utils/cx'

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  language?: string
  code?: string
  children?: ReactNode
}

export function CodeBlock({ language, code, className, children, ...rest }: CodeBlockProps) {
  return (
    <pre
      data-nv-component="code-block"
      data-nv-language={language}
      className={cx('nv-code', className)}
      {...rest}
    >
      <code>{code ?? children}</code>
    </pre>
  )
}
