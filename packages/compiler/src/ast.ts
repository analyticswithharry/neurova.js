/**
 * neurova .nv source — Abstract Syntax Tree types.
 *
 * The .nv language (original to neurova) is a small single-file
 * component format. Grammar (informal):
 *
 *   File      := (Import)* (Component)+
 *   Import    := "import" RAW_JS_UNTIL_NEWLINE
 *   Component := "component" IDENT "(" PARAMS? ")" "{" Body "}"
 *   Body      := (Statement)* Template
 *   Statement := ("state" | "let" | "const") IDENT "=" RAW_EXPR
 *              | "effect" "{" RAW_BLOCK "}"
 *              | RAW_EXPR
 *   Template  := Element
 *   Element   := "<" IDENT (Attr)* ("/>" | ">" (Element|Text|Mustache)* "</" IDENT ">")
 *   Attr      := IDENT ("=" ("\"...\"" | "{" RAW_EXPR "}"))?
 *              | "on:" IDENT "=" "{" RAW_EXPR "}"
 *   Mustache  := "{" RAW_EXPR "}"
 *
 * "RAW_EXPR" / "RAW_BLOCK" are passed through verbatim to the
 * generated JavaScript; the compiler does not try to parse the
 * embedded JS expression grammar.
 */

export interface SourceLoc {
  line: number
  column: number
}

export interface FileNode {
  kind: 'File'
  imports: ImportNode[]
  components: ComponentNode[]
}

export interface ImportNode {
  kind: 'Import'
  source: string // verbatim text after `import`
  loc: SourceLoc
}

export interface ComponentNode {
  kind: 'Component'
  name: string
  params: string // verbatim text inside parentheses, may be empty
  statements: StatementNode[]
  template: ElementNode
  loc: SourceLoc
}

export type StatementNode = StateDecl | BindingDecl | EffectStmt | ExprStmt

export interface StateDecl {
  kind: 'State'
  name: string
  init: string
  loc: SourceLoc
}

export interface BindingDecl {
  kind: 'Binding'
  keyword: 'let' | 'const'
  name: string
  init: string
  loc: SourceLoc
}

export interface EffectStmt {
  kind: 'Effect'
  body: string
  loc: SourceLoc
}

export interface ExprStmt {
  kind: 'ExprStmt'
  expr: string
  loc: SourceLoc
}

export interface ElementNode {
  kind: 'Element'
  tag: string
  attrs: AttrNode[]
  children: TemplateChild[]
  selfClosing: boolean
  loc: SourceLoc
}

export type TemplateChild = ElementNode | TextNode | MustacheNode

export interface TextNode {
  kind: 'Text'
  value: string
  loc: SourceLoc
}

export interface MustacheNode {
  kind: 'Mustache'
  expr: string
  loc: SourceLoc
}

export type AttrNode = StaticAttr | ExprAttr | EventAttr

export interface StaticAttr {
  kind: 'StaticAttr'
  name: string
  value: string
}

export interface ExprAttr {
  kind: 'ExprAttr'
  name: string
  expr: string
}

export interface EventAttr {
  kind: 'EventAttr'
  event: string // already lowercased without "on:" prefix
  expr: string
}
