/**
 * neurova .nv parser — original implementation.
 *
 * Strategy:
 *  1. Top-level scan: skip whitespace, collect `import ...` lines,
 *     then look for `component Name(params) { ... }` blocks.
 *  2. Inside a component body, read statements line-by-line until the
 *     first character of a non-whitespace line is `<` — that begins
 *     the template.
 *  3. Template parser walks tag-by-tag using a tiny state machine.
 *
 * Embedded JS expressions are extracted by tracking matched braces /
 * brackets / parentheses and string/template literal state, but the
 * expression text itself is not interpreted.
 */

import type {
  AttrNode,
  ComponentNode,
  ElementNode,
  FileNode,
  ImportNode,
  MustacheNode,
  SourceLoc,
  StatementNode,
  TemplateChild,
  TextNode,
} from './ast.js'

export class CompileError extends Error {
  loc: SourceLoc
  constructor(message: string, loc: SourceLoc) {
    super(`${message} (line ${loc.line}, col ${loc.column})`)
    this.loc = loc
  }
}

class Cursor {
  src: string
  pos = 0
  constructor(src: string) {
    this.src = src
  }
  loc(at = this.pos): SourceLoc {
    let line = 1
    let column = 1
    for (let i = 0; i < at; i++) {
      if (this.src.charCodeAt(i) === 10) {
        line++
        column = 1
      } else {
        column++
      }
    }
    return { line, column }
  }
  peek(offset = 0): string {
    return this.src[this.pos + offset] ?? ''
  }
  eof(): boolean {
    return this.pos >= this.src.length
  }
  startsWith(s: string): boolean {
    return this.src.startsWith(s, this.pos)
  }
  skipWs(): void {
    while (!this.eof()) {
      const c = this.peek()
      if (c === ' ' || c === '\t' || c === '\n' || c === '\r') {
        this.pos++
        continue
      }
      // line comment
      if (c === '/' && this.peek(1) === '/') {
        while (!this.eof() && this.peek() !== '\n') this.pos++
        continue
      }
      // block comment
      if (c === '/' && this.peek(1) === '*') {
        this.pos += 2
        while (!this.eof() && !(this.peek() === '*' && this.peek(1) === '/')) {
          this.pos++
        }
        if (!this.eof()) this.pos += 2
        continue
      }
      break
    }
  }
  consume(s: string): boolean {
    if (this.startsWith(s)) {
      this.pos += s.length
      return true
    }
    return false
  }
  expect(s: string): void {
    if (!this.consume(s)) {
      throw new CompileError(`Expected "${s}"`, this.loc())
    }
  }
  readIdent(): string {
    const start = this.pos
    while (!this.eof()) {
      const c = this.src.charCodeAt(this.pos)
      const isAlnum =
        (c >= 48 && c <= 57) || // 0-9
        (c >= 65 && c <= 90) || // A-Z
        (c >= 97 && c <= 122) || // a-z
        c === 95 || // _
        c === 36 // $
      if (!isAlnum) break
      this.pos++
    }
    if (this.pos === start) {
      throw new CompileError('Expected identifier', this.loc())
    }
    return this.src.slice(start, this.pos)
  }
}

/**
 * Read characters until the matching closing brace at the same nesting
 * level, respecting strings, template literals, regex-ish literals,
 * comments, parens, and brackets. Cursor must be positioned just after
 * the opening `{`. Returns the slice between the braces (exclusive)
 * and leaves the cursor just after the closing `}`.
 */
function readBalanced(cur: Cursor, open: string, close: string): string {
  const start = cur.pos
  let depth = 1
  while (!cur.eof()) {
    const c = cur.peek()
    if (c === '"' || c === "'" || c === '`') {
      cur.pos++
      while (!cur.eof()) {
        const ch = cur.peek()
        if (ch === '\\') {
          cur.pos += 2
          continue
        }
        if (ch === c) {
          cur.pos++
          break
        }
        cur.pos++
      }
      continue
    }
    if (c === '/' && cur.peek(1) === '/') {
      while (!cur.eof() && cur.peek() !== '\n') cur.pos++
      continue
    }
    if (c === '/' && cur.peek(1) === '*') {
      cur.pos += 2
      while (!cur.eof() && !(cur.peek() === '*' && cur.peek(1) === '/')) {
        cur.pos++
      }
      if (!cur.eof()) cur.pos += 2
      continue
    }
    if (c === open) {
      depth++
      cur.pos++
      continue
    }
    if (c === close) {
      depth--
      if (depth === 0) {
        const text = cur.src.slice(start, cur.pos)
        cur.pos++ // consume close
        return text
      }
      cur.pos++
      continue
    }
    cur.pos++
  }
  throw new CompileError(`Unbalanced "${open}"`, cur.loc(start))
}

function readUntilEol(cur: Cursor): string {
  const start = cur.pos
  while (!cur.eof() && cur.peek() !== '\n') cur.pos++
  return cur.src.slice(start, cur.pos).trim()
}

function parseImports(cur: Cursor): ImportNode[] {
  const imports: ImportNode[] = []
  for (;;) {
    cur.skipWs()
    if (!cur.startsWith('import ') && !cur.startsWith('import\t')) break
    const loc = cur.loc()
    cur.pos += 'import'.length
    const source = readUntilEol(cur)
    imports.push({ kind: 'Import', source, loc })
  }
  return imports
}

function parseStatements(cur: Cursor): StatementNode[] {
  const out: StatementNode[] = []
  for (;;) {
    cur.skipWs()
    if (cur.eof()) break
    if (cur.peek() === '<') break // template begins
    if (cur.peek() === '}') break // end of component body

    const loc = cur.loc()
    if (cur.startsWith('state ')) {
      cur.pos += 'state '.length
      cur.skipWs()
      const name = cur.readIdent()
      cur.skipWs()
      cur.expect('=')
      const init = readUntilEol(cur)
      out.push({ kind: 'State', name, init, loc })
      continue
    }
    if (cur.startsWith('let ') || cur.startsWith('const ')) {
      const keyword = cur.startsWith('let ') ? 'let' : 'const'
      cur.pos += keyword.length + 1
      cur.skipWs()
      const name = cur.readIdent()
      cur.skipWs()
      cur.expect('=')
      const init = readUntilEol(cur)
      out.push({ kind: 'Binding', keyword, name, init, loc })
      continue
    }
    if (cur.startsWith('effect ')) {
      cur.pos += 'effect '.length
      cur.skipWs()
      cur.expect('{')
      const body = readBalanced(cur, '{', '}')
      out.push({ kind: 'Effect', body, loc })
      continue
    }
    // bare expression line
    const expr = readUntilEol(cur)
    if (expr) out.push({ kind: 'ExprStmt', expr, loc })
  }
  return out
}

function parseAttr(cur: Cursor): AttrNode {
  let name = ''
  // allow attribute names with letters, digits, '-', ':'
  while (!cur.eof()) {
    const c = cur.peek()
    if (
      (c >= 'a' && c <= 'z') ||
      (c >= 'A' && c <= 'Z') ||
      (c >= '0' && c <= '9') ||
      c === '-' ||
      c === ':' ||
      c === '_'
    ) {
      name += c
      cur.pos++
    } else break
  }
  if (!name) throw new CompileError('Expected attribute name', cur.loc())

  cur.skipWs()
  if (cur.peek() !== '=') {
    return { kind: 'StaticAttr', name, value: '' }
  }
  cur.pos++ // '='
  cur.skipWs()
  const q = cur.peek()
  if (q === '"' || q === "'") {
    cur.pos++
    const start = cur.pos
    while (!cur.eof() && cur.peek() !== q) cur.pos++
    const value = cur.src.slice(start, cur.pos)
    cur.expect(q)
    if (name.startsWith('on:')) {
      // unusual but allowed: on:click="handler" — treat as event with
      // a free-form expression matching the string literal.
      return { kind: 'EventAttr', event: name.slice(3).toLowerCase(), expr: JSON.stringify(value) }
    }
    return { kind: 'StaticAttr', name, value }
  }
  if (q === '{') {
    cur.pos++
    const expr = readBalanced(cur, '{', '}')
    if (name.startsWith('on:')) {
      return { kind: 'EventAttr', event: name.slice(3).toLowerCase(), expr: expr.trim() }
    }
    return { kind: 'ExprAttr', name, expr: expr.trim() }
  }
  throw new CompileError('Expected attribute value', cur.loc())
}

function parseElement(cur: Cursor): ElementNode {
  const loc = cur.loc()
  cur.expect('<')
  const tag = cur.readIdent()
  const attrs: AttrNode[] = []
  for (;;) {
    cur.skipWs()
    if (cur.peek() === '/' && cur.peek(1) === '>') {
      cur.pos += 2
      return { kind: 'Element', tag, attrs, children: [], selfClosing: true, loc }
    }
    if (cur.peek() === '>') {
      cur.pos++
      break
    }
    attrs.push(parseAttr(cur))
  }

  const children: TemplateChild[] = []
  let textBuf = ''
  let textStart = cur.pos

  const flushText = (): void => {
    if (textBuf.length === 0) return
    // Trim purely-whitespace runs (between elements) but preserve
    // intentional whitespace by collapsing only fully-blank runs.
    const trimmed = textBuf.replace(/\s+/g, ' ')
    if (trimmed.trim().length > 0) {
      children.push({ kind: 'Text', value: trimmed, loc: cur.loc(textStart) })
    }
    textBuf = ''
  }

  for (;;) {
    if (cur.eof()) {
      throw new CompileError(`Unclosed element <${tag}>`, loc)
    }
    if (cur.peek() === '<' && cur.peek(1) === '/') {
      flushText()
      cur.pos += 2
      const closing = cur.readIdent()
      if (closing !== tag) {
        throw new CompileError(`Mismatched closing tag </${closing}> for <${tag}>`, cur.loc())
      }
      cur.skipWs()
      cur.expect('>')
      return { kind: 'Element', tag, attrs, children, selfClosing: false, loc }
    }
    if (cur.peek() === '<') {
      flushText()
      const child = parseElement(cur)
      children.push(child)
      textStart = cur.pos
      continue
    }
    if (cur.peek() === '{') {
      flushText()
      cur.pos++
      const exprLoc = cur.loc()
      const expr = readBalanced(cur, '{', '}').trim()
      const node: MustacheNode = { kind: 'Mustache', expr, loc: exprLoc }
      children.push(node)
      textStart = cur.pos
      continue
    }
    if (textBuf.length === 0) textStart = cur.pos
    textBuf += cur.peek()
    cur.pos++
  }
}

function parseComponent(cur: Cursor): ComponentNode {
  const loc = cur.loc()
  cur.expect('component')
  cur.skipWs()
  const name = cur.readIdent()
  cur.skipWs()
  cur.expect('(')
  const params = readBalanced(cur, '(', ')').trim()
  cur.skipWs()
  cur.expect('{')

  const statements = parseStatements(cur)
  cur.skipWs()

  if (cur.peek() !== '<') {
    throw new CompileError(`Expected template element in component "${name}"`, cur.loc())
  }
  const template = parseElement(cur)

  cur.skipWs()
  cur.expect('}')

  return { kind: 'Component', name, params, statements, template, loc }
}

export function parse(source: string): FileNode {
  const cur = new Cursor(source)
  const imports = parseImports(cur)
  const components: ComponentNode[] = []
  for (;;) {
    cur.skipWs()
    if (cur.eof()) break
    if (!cur.startsWith('component ')) {
      throw new CompileError('Expected `import` or `component` declaration at top level', cur.loc())
    }
    components.push(parseComponent(cur))
  }
  if (components.length === 0) {
    throw new CompileError('A .nv file must define at least one component', { line: 1, column: 1 })
  }
  return { kind: 'File', imports, components }
}
