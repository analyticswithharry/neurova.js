// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest'
import { For, h, mount } from '../src/dom.js'
import { signal } from '../src/reactivity.js'

describe('h + mount', () => {
  it('renders static text', () => {
    const host = document.createElement('div')
    mount(() => h('span', null, 'hello'), host)
    expect(host.innerHTML).toBe('<span>hello</span>')
  })

  it('reactive child updates DOM', () => {
    const [n, setN] = signal(0)
    const host = document.createElement('div')
    mount(() => h('p', null, () => `count:${n()}`), host)
    expect(host.textContent).toBe('count:0')
    setN(7)
    expect(host.textContent).toBe('count:7')
  })

  it('reactive attribute', () => {
    const [cls, setCls] = signal('a')
    const host = document.createElement('div')
    mount(() => h('div', { class: () => cls() }), host)
    const div = host.querySelector('div')!
    expect(div.className).toBe('a')
    setCls('b')
    expect(div.className).toBe('b')
  })

  it('event listener via on: prefix', () => {
    const [count, setCount] = signal(0)
    const host = document.createElement('div')
    mount(() => h('button', { 'on:click': () => setCount((c) => c + 1) }, 'tap'), host)
    const btn = host.querySelector('button')!
    btn.click()
    btn.click()
    expect(count()).toBe(2)
  })

  it('For renders a list', () => {
    const [items, setItems] = signal<string[]>(['a', 'b'])
    const host = document.createElement('div')
    mount(
      () => h('ul', null, For({ each: () => items(), children: (it) => h('li', null, it) })),
      host,
    )
    expect(host.querySelectorAll('li').length).toBe(2)
    setItems(['x', 'y', 'z'])
    expect(host.querySelectorAll('li').length).toBe(3)
  })
})
