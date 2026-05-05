import Link from 'next/link'
import type { ReactNode } from 'react'
import './globals.css'

export const metadata = {
  title: 'neurova — the powerful framework for AI-native apps',
  description: 'UI + Backend + AI in one TypeScript framework.',
}

const NAV: { href: string; label: string }[] = [
  { href: '/', label: 'Home' },
  { href: '/docs/getting-started', label: 'Getting started' },
  { href: '/docs/core', label: '@neurova/core' },
  { href: '/docs/ui', label: '@neurova/ui' },
  { href: '/docs/backend', label: '@neurova/backend' },
  { href: '/docs/ai', label: '@neurova/ai' },
  { href: '/docs/cli', label: '@neurova/cli' },
  { href: '/docs/testing', label: '@neurova/testing' },
  { href: '/examples', label: 'Examples' },
]

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="nv-header">
          <Link href="/" className="nv-brand">
            neurova
          </Link>
          <nav>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}>
                {n.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="nv-main">{children}</main>
        <footer className="nv-footer">
          © 2026 @analyticswithharry and Squid Consultancy Group Ltd · MIT licensed
        </footer>
      </body>
    </html>
  )
}
