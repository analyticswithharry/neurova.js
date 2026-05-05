/**
 * @neurova/compiler — public API
 */
export { parse, CompileError } from './parser.js'
export { emit, type EmitOptions, type EmitTarget } from './codegen.js'
export type * from './ast.js'

import { parse } from './parser.js'
import { emit, type EmitOptions } from './codegen.js'

export interface CompileResult {
  code: string
}

export function compile(source: string, opts: EmitOptions = {}): CompileResult {
  const file = parse(source)
  const code = emit(file, opts)
  return { code }
}
