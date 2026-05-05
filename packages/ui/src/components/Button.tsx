import { type ButtonHTMLAttributes, forwardRef } from 'react'
import { cx } from '../utils/cx'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: import('react').ReactNode
  rightIcon?: import('react').ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading,
    className,
    children,
    disabled,
    leftIcon,
    rightIcon,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      data-nv-component="button"
      data-nv-variant={variant}
      data-nv-size={size}
      data-nv-loading={loading ? 'true' : undefined}
      className={cx('nv-btn', className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? <span className="nv-btn-spinner" aria-hidden /> : null}
      {leftIcon ? (
        <span className="nv-btn-icon" aria-hidden>
          {leftIcon}
        </span>
      ) : null}
      <span className="nv-btn-label">{children}</span>
      {rightIcon ? (
        <span className="nv-btn-icon" aria-hidden>
          {rightIcon}
        </span>
      ) : null}
    </button>
  )
})
