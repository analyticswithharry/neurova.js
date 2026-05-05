import { type FormHTMLAttributes, type ReactNode, useCallback } from 'react'
import { z, parse } from '@neurova/core'
import { cx } from '../utils/cx'

export interface FormProps<S extends z.ZodTypeAny>
  extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  schema?: S
  onSubmit: (values: S extends z.ZodTypeAny ? z.infer<S> : Record<string, unknown>) => void | Promise<void>
  children: ReactNode
}

export function Form<S extends z.ZodTypeAny>({
  schema,
  onSubmit,
  className,
  children,
  ...rest
}: FormProps<S>) {
  const handle = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      const data = Object.fromEntries(new FormData(e.currentTarget).entries())
      const value = schema ? parse(schema, data) : data
      void onSubmit(value as never)
    },
    [schema, onSubmit],
  )
  return (
    <form
      data-nv-component="form"
      onSubmit={handle}
      className={cx('nv-form', className)}
      {...rest}
    >
      {children}
    </form>
  )
}
