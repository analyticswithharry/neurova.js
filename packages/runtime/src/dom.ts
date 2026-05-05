/**
 * neurova/runtime — DOM renderer
 *
 * A tiny hyperscript renderer that wires reactive values directly into
 * DOM nodes. No virtual DOM: a signal read inside an attribute or child
 * position becomes a long-lived effect that mutates the real node.
 */

import { effect, untrack } from './reactivity.js'

export type Child =
  | string
  | number
  | boolean
  | null
  | undefined
  | Node
  | (() => Child)
  | Child[]

export type Props = Record<string, unknown> & {
  children?: Child | Child[]
}

export type Component<P = Record<string, unknown>> = (props: P) => Node

const EVENT_PREFIX = 'on:'

function setAttr(el: Element, key: string, value: unknown): void {
  if (value == null || value === false) {
    el.removeAttribute(key)
    return
  }
  if (value === true) {
    el.setAttribute(key, '')
    return
  }
  el.setAttribute(key, String(value))
}

function appendChild(parent: Node, child: Child): void {
  if (child == null || child === false || child === true) return

  if (Array.isArray(child)) {
    for (const c of child) appendChild(parent, c)
    return
  }

  if (typeof child === 'function') {
    // Reactive child position: anchor + replaceable nodes.
    const start = document.createComment('')
    const end = document.createComment('')
    parent.appendChild(start)
    parent.appendChild(end)

    let current: Node[] = []

    effect(() => {
      const next = (child as () => Child)()
      // Remove existing
      for (const n of current) n.parentNode?.removeChild(n)
      current = []
      // Insert new
      const frag = document.createDocumentFragment()
      const collect = (c: Child): void => {
        if (c == null || c === false || c === true) return
        if (Array.isArray(c)) {
          for (const cc of c) collect(cc)
          return
        }
        if (c instanceof Node) {
          current.push(c)
          frag.appendChild(c)
          return
        }
        const text = document.createTextNode(String(c))
        current.push(text)
        frag.appendChild(text)
      }
      untrack(() => collect(next))
      end.parentNode?.insertBefore(frag, end)
    })
    return
  }

  if (child instanceof Node) {
    parent.appendChild(child)
    return
  }

  parent.appendChild(document.createTextNode(String(child)))
}

/**
 * Hyperscript. `tag` may be a string (intrinsic element) or a component
 * function. Props starting with `on:` register event listeners; all
 * other props become attributes (functions become reactive bindings).
 */
export function h(
  tag: string | Component<Props>,
  props: Props | null,
  ...children: Child[]
): Node {
  const finalProps: Props = props ?? {}
  if (children.length > 0) finalProps.children = children

  if (typeof tag === 'function') {
    return tag(finalProps)
  }

  const el = document.createElement(tag)

  for (const [key, value] of Object.entries(finalProps)) {
    if (key === 'children') continue

    if (key.startsWith(EVENT_PREFIX)) {
      const event = key.slice(EVENT_PREFIX.length).toLowerCase()
      el.addEventListener(event, value as EventListener)
      continue
    }

    if (key === 'class' || key === 'className') {
      if (typeof value === 'function') {
        effect(() => {
          el.className = String((value as () => unknown)() ?? '')
        })
      } else {
        el.className = String(value ?? '')
      }
      continue
    }

    if (key === 'style' && value && typeof value === 'object') {
      for (const [prop, v] of Object.entries(value as Record<string, unknown>)) {
        ;(el.style as unknown as Record<string, string>)[prop] = String(v ?? '')
      }
      continue
    }

    if (typeof value === 'function') {
      effect(() => {
        setAttr(el, key, (value as () => unknown)())
      })
    } else {
      setAttr(el, key, value)
    }
  }

  const kids = finalProps.children
  if (kids != null) {
    if (Array.isArray(kids)) {
      for (const c of kids) appendChild(el, c)
    } else {
      appendChild(el, kids)
    }
  }

  return el
}

/** Mount a component into a host element. Returns a disposer. */
export function mount(component: () => Node, host: Element): () => void {
  const node = component()
  host.appendChild(node)
  return () => {
    if (node.parentNode === host) host.removeChild(node)
  }
}

/** Render a list of items reactively, keyed by index. */
export function For<T>(props: {
  each: () => readonly T[]
  children: (item: T, index: number) => Node
}): Node {
  const anchor = document.createComment('for')
  const wrapper = document.createDocumentFragment()
  wrapper.appendChild(anchor)

  let current: Node[] = []
  effect(() => {
    const items = props.each()
    for (const n of current) n.parentNode?.removeChild(n)
    current = []
    const frag = document.createDocumentFragment()
    untrack(() => {
      items.forEach((item, i) => {
        const node = props.children(item, i)
        current.push(node)
        frag.appendChild(node)
      })
    })
    anchor.parentNode?.insertBefore(frag, anchor.nextSibling)
  })

  return wrapper
}
