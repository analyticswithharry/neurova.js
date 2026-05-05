/**
 * Design tokens for neurova. CSS variables are the runtime representation;
 * this module exposes them as typed JS so JS-driven styling stays in sync.
 */
export const tokens = {
  color: {
    primary: 'var(--nv-color-primary)',
    primaryFg: 'var(--nv-color-primary-fg)',
    bg: 'var(--nv-color-bg)',
    fg: 'var(--nv-color-fg)',
    muted: 'var(--nv-color-muted)',
    border: 'var(--nv-color-border)',
    danger: 'var(--nv-color-danger)',
    success: 'var(--nv-color-success)',
    warning: 'var(--nv-color-warning)',
  },
  radius: {
    sm: 'var(--nv-radius-sm)',
    md: 'var(--nv-radius-md)',
    lg: 'var(--nv-radius-lg)',
    full: '9999px',
  },
  space: (n: number) => `calc(${n} * var(--nv-space-unit))`,
  font: {
    sans: 'var(--nv-font-sans)',
    mono: 'var(--nv-font-mono)',
  },
  shadow: {
    sm: 'var(--nv-shadow-sm)',
    md: 'var(--nv-shadow-md)',
    lg: 'var(--nv-shadow-lg)',
  },
} as const

export type Theme = 'light' | 'dark'

export const themePresets: Record<Theme, Record<string, string>> = {
  light: {
    '--nv-color-primary': '#4f46e5',
    '--nv-color-primary-fg': '#ffffff',
    '--nv-color-bg': '#ffffff',
    '--nv-color-fg': '#0f172a',
    '--nv-color-muted': '#64748b',
    '--nv-color-border': '#e2e8f0',
    '--nv-color-danger': '#dc2626',
    '--nv-color-success': '#16a34a',
    '--nv-color-warning': '#f59e0b',
    '--nv-radius-sm': '4px',
    '--nv-radius-md': '8px',
    '--nv-radius-lg': '14px',
    '--nv-space-unit': '4px',
    '--nv-font-sans': 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    '--nv-font-mono': 'ui-monospace, SFMono-Regular, Menlo, monospace',
    '--nv-shadow-sm': '0 1px 2px rgba(0,0,0,.06)',
    '--nv-shadow-md': '0 4px 12px rgba(0,0,0,.08)',
    '--nv-shadow-lg': '0 12px 32px rgba(0,0,0,.12)',
  },
  dark: {
    '--nv-color-primary': '#818cf8',
    '--nv-color-primary-fg': '#0f172a',
    '--nv-color-bg': '#0b1020',
    '--nv-color-fg': '#e2e8f0',
    '--nv-color-muted': '#94a3b8',
    '--nv-color-border': '#1e293b',
    '--nv-color-danger': '#f87171',
    '--nv-color-success': '#4ade80',
    '--nv-color-warning': '#fbbf24',
    '--nv-radius-sm': '4px',
    '--nv-radius-md': '8px',
    '--nv-radius-lg': '14px',
    '--nv-space-unit': '4px',
    '--nv-font-sans': 'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
    '--nv-font-mono': 'ui-monospace, SFMono-Regular, Menlo, monospace',
    '--nv-shadow-sm': '0 1px 2px rgba(0,0,0,.4)',
    '--nv-shadow-md': '0 4px 12px rgba(0,0,0,.5)',
    '--nv-shadow-lg': '0 12px 32px rgba(0,0,0,.6)',
  },
}

export function applyTheme(theme: Theme, target: HTMLElement = document.documentElement): void {
  const vars = themePresets[theme]
  for (const [k, v] of Object.entries(vars)) target.style.setProperty(k, v)
  target.dataset.nvTheme = theme
}
