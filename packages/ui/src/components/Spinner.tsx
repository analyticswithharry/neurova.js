export function Spinner({ size = 18 }: { size?: number }) {
  return (
    <svg
      data-nv-component="spinner"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      role="status"
      aria-label="Loading"
      className="nv-spinner"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
        fill="none"
        opacity="0.25"
      />
      <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  )
}
