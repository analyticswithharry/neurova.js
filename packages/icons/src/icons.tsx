import type { SVGProps } from 'react'

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number | string
}

const make =
  (path: React.ReactNode, viewBox = '0 0 24 24') =>
  ({ size = 20, strokeWidth = 2, ...rest }: IconProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {path}
    </svg>
  )

export const IconCheck = make(<polyline points="20 6 9 17 4 12" />)
export const IconClose = make(
  <>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </>,
)
export const IconChevronDown = make(<polyline points="6 9 12 15 18 9" />)
export const IconChevronRight = make(<polyline points="9 18 15 12 9 6" />)
export const IconSpark = make(
  <path d="M12 2l2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4L12 2z" />,
)
export const IconBrain = make(
  <path d="M9 4a3 3 0 0 0-3 3v0a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3v0a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3v0a3 3 0 0 0 3-3v-2a3 3 0 0 0-3-3v0a3 3 0 0 0-3-3H9z" />,
)
export const IconSend = make(
  <>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </>,
)
export const IconLoader = make(<line x1="12" y1="2" x2="12" y2="6" />)
export const IconUser = make(
  <>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </>,
)
export const IconBot = make(
  <>
    <rect x="3" y="7" width="18" height="13" rx="3" />
    <line x1="12" y1="2" x2="12" y2="7" />
    <circle cx="9" cy="13" r="1.2" />
    <circle cx="15" cy="13" r="1.2" />
  </>,
)
