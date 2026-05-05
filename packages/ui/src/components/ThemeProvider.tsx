import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { type Theme, applyTheme } from '@neurova/themes'

interface ThemeCtx {
  theme: Theme
  setTheme: (t: Theme) => void
}

const Ctx = createContext<ThemeCtx | null>(null)

export interface ThemeProviderProps {
  defaultTheme?: Theme
  children: ReactNode
}

export function ThemeProvider({ defaultTheme = 'light', children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme)

  useEffect(() => {
    if (typeof document === 'undefined') return
    applyTheme(theme)
  }, [theme])

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>
}

export function useTheme(): ThemeCtx {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTheme must be used inside <ThemeProvider>')
  return v
}
