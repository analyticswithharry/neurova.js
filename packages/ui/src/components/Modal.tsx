import { useEffect, type ReactNode } from 'react'
import { cx } from '../utils/cx'

export interface ModalProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  children?: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="nv-modal-backdrop" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        className={cx('nv-modal', className)}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? <div className="nv-modal-header">{title}</div> : null}
        <div className="nv-modal-body">{children}</div>
      </div>
    </div>
  )
}
