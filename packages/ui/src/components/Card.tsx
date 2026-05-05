import type { HTMLAttributes, ReactNode } from 'react'
import { cx } from '../utils/cx'

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  footer?: ReactNode
}

export function Card({ title, footer, className, children, ...rest }: CardProps) {
  return (
    <div data-nv-component="card" className={cx('nv-card', className)} {...rest}>
      {title ? <div className="nv-card-header">{title}</div> : null}
      <div className="nv-card-body">{children}</div>
      {footer ? <div className="nv-card-footer">{footer}</div> : null}
    </div>
  )
}
