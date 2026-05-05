import { type InputHTMLAttributes, forwardRef } from 'react'
import { cx } from '../utils/cx'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  invalid?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, invalid, size = 'md', ...rest },
  ref,
) {
  return (
    <input
      ref={ref}
      data-nv-component="input"
      data-nv-size={size}
      data-nv-invalid={invalid ? 'true' : undefined}
      aria-invalid={invalid || undefined}
      className={cx('nv-input', className)}
      {...rest}
    />
  )
})
