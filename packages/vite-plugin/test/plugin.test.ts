import { describe, expect, it } from 'vitest'
import neurova from '../src/index.js'

describe('vite-plugin', () => {
  it('compiles .nv files', () => {
    const plugin = neurova()
    const result = plugin.transform('component Hi() {\n  <p>hi</p>\n}', '/x/Hi.nv')
    expect(result).not.toBeNull()
    expect(result?.code).toContain('h("p"')
  })

  it('passes through non-.nv files', () => {
    const plugin = neurova()
    expect(plugin.transform('let x = 1', '/x/main.ts')).toBeNull()
  })
})
