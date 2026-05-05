#!/usr/bin/env node
/**
 * neurova-compile — minimal CLI: read a .nv file, write a .js file.
 *
 * Usage:
 *   neurova-compile <input.nv> [--target runtime|react] [-o output.js]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { compile, type EmitTarget } from './index.js'

function main(): void {
  const args = process.argv.slice(2)
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    process.stdout.write(
      'Usage: neurova-compile <input.nv> [--target runtime|react] [-o output.js]\n',
    )
    process.exit(args.length === 0 ? 1 : 0)
  }

  let input: string | undefined
  let output: string | undefined
  let target: EmitTarget = 'runtime'

  for (let i = 0; i < args.length; i++) {
    const a = args[i]!
    if (a === '--target') {
      const v = args[++i]
      if (v !== 'runtime' && v !== 'react') {
        process.stderr.write(`Invalid --target: ${v}\n`)
        process.exit(2)
      }
      target = v
    } else if (a === '-o' || a === '--out') {
      output = args[++i]
    } else if (!input) {
      input = a
    }
  }

  if (!input) {
    process.stderr.write('Missing input file\n')
    process.exit(2)
  }

  const src = readFileSync(resolve(input), 'utf8')
  const { code } = compile(src, { target })
  if (output) {
    writeFileSync(resolve(output), code, 'utf8')
  } else {
    process.stdout.write(code + '\n')
  }
}

main()
