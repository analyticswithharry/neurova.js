import { describe, expect, it } from 'vitest'
import { compile } from '../src/index.js'
import { parse } from '../src/parser.js'

describe('parser', () => {
  it('parses a simple component', () => {
    const src = `component Hello(name) {
  <h1 class="greeting">Hello {name}!</h1>
}`
    const file = parse(src)
    expect(file.components).toHaveLength(1)
    const c = file.components[0]!
    expect(c.name).toBe('Hello')
    expect(c.params).toBe('name')
    expect(c.template.tag).toBe('h1')
    expect(c.template.attrs[0]).toMatchObject({
      kind: 'StaticAttr',
      name: 'class',
      value: 'greeting',
    })
  })

  it('parses state and event handlers', () => {
    const src = `component Counter() {
  state count = 0
  <button on:click={() => count.set(count() + 1)}>{count()}</button>
}`
    const file = parse(src)
    const c = file.components[0]!
    expect(c.statements[0]).toMatchObject({ kind: 'State', name: 'count', init: '0' })
    const btn = c.template
    expect(btn.tag).toBe('button')
    expect(btn.attrs[0]).toMatchObject({ kind: 'EventAttr', event: 'click' })
  })

  it('parses nested elements and mustaches', () => {
    const src = `component Card() {
  <div class="card"><span>{title}</span><p>{body}</p></div>
}`
    const file = parse(src)
    const root = file.components[0]?.template
    expect(root).toBeDefined()
    expect(root!.children).toHaveLength(2)
    expect((root!.children[0] as { tag: string }).tag).toBe('span')
  })

  it('parses self-closing tags', () => {
    const src = `component Pic() {
  <img src="x.png" />
}`
    const file = parse(src)
    expect(file.components[0]?.template.selfClosing).toBe(true)
  })

  it('throws on mismatched closing tag', () => {
    expect(() => parse('component X() { <div></span> }')).toThrow(/Mismatched/)
  })

  it('throws when no template', () => {
    expect(() => parse('component X() { state n = 1 }')).toThrow(/template/)
  })
})

describe('codegen runtime target', () => {
  it('emits h() calls for static template', () => {
    const { code } = compile(`component Hi() {
  <p class="x">hello</p>
}`)
    expect(code).toContain("from '@neurova/runtime'")
    expect(code).toContain('h("p"')
    expect(code).toContain('"class": "x"')
    expect(code).toContain('"hello"')
    expect(code).toContain('export default Hi')
  })

  it('emits signal() for state and wraps mustaches in thunks', () => {
    const { code } = compile(`component Counter() {
  state count = 0
  <button>{count()}</button>
}`)
    expect(code).toContain('signal(0)')
    expect(code).toContain('Object.assign(__nv_count[0], { set: __nv_count[1] })')
    expect(code).toContain('() => (count())')
  })

  it('emits on: events verbatim', () => {
    const { code } = compile(`component B() {
  state n = 0
  <button on:click={() => n.set(n() + 1)}>tap</button>
}`)
    expect(code).toContain('"on:click"')
    expect(code).toContain('n.set(n() + 1)')
  })
})

describe('codegen react target', () => {
  it('emits React.createElement', () => {
    const { code } = compile(
      `component Hi() {
  <p>hello</p>
}`,
      { target: 'react' },
    )
    expect(code).toContain("import * as React from 'react'")
    expect(code).toContain('React.createElement("p"')
  })
})
