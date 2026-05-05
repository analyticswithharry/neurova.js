/**
 * Optional JSX runtime so consumers can write JSX that targets neurova's
 * hyperscript directly:
 *
 *   // tsconfig: { "jsx": "react-jsx", "jsxImportSource": "@neurova/runtime" }
 */
import { type Child, type Component, type Props, h } from './dom.js'

export function jsx(type: string | Component<Props>, props: Props, _key?: string): Node {
  const { children, ...rest } = props
  if (Array.isArray(children)) {
    return h(type, rest as Props, ...(children as Child[]))
  }
  if (children !== undefined) {
    return h(type, rest as Props, children as Child)
  }
  return h(type, rest as Props)
}

export const jsxs = jsx
export const jsxDEV = jsx
export function Fragment(props: { children?: Child | Child[] }): Node {
  const frag = document.createDocumentFragment()
  const kids = props.children
  if (Array.isArray(kids)) {
    for (const c of kids) appendOne(frag, c)
  } else if (kids !== undefined) {
    appendOne(frag, kids)
  }
  return frag
}

function appendOne(parent: Node, c: Child): void {
  if (c == null || c === false || c === true) return
  if (c instanceof Node) {
    parent.appendChild(c)
    return
  }
  if (Array.isArray(c)) {
    for (const cc of c) appendOne(parent, cc)
    return
  }
  parent.appendChild(document.createTextNode(String(c)))
}
