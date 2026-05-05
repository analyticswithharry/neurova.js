import { mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const VERSION = '2.2.2'

const HELP = `neurova ${VERSION}

Usage:
  neurova <command> [options]

Commands:
  init <name>             Scaffold a new neurova app in ./<name>
  info                    Print version and environment info
  help                    Show this help

Examples:
  neurova init my-app
  neurova info
`

async function main(argv: string[]): Promise<number> {
  const [cmd, ...rest] = argv
  switch (cmd) {
    case 'init':
      return cmdInit(rest)
    case 'info':
      return cmdInfo()
    case 'help':
    case '--help':
    case '-h':
    case undefined:
      process.stdout.write(HELP)
      return 0
    case 'version':
    case '--version':
    case '-v':
      process.stdout.write(`${VERSION}\n`)
      return 0
    default:
      process.stderr.write(`Unknown command: ${cmd}\n${HELP}`)
      return 1
  }
}

async function cmdInfo(): Promise<number> {
  process.stdout.write(
    `neurova ${VERSION}\nnode ${process.version}\nplatform ${process.platform} ${process.arch}\n`,
  )
  return 0
}

async function cmdInit(args: string[]): Promise<number> {
  const name = args[0]
  if (!name) {
    process.stderr.write('Usage: neurova init <name>\n')
    return 1
  }
  const dest = resolve(process.cwd(), name)
  const here = dirname(fileURLToPath(import.meta.url))
  // CLI is published with ./templates next to dist/, so resolve relative to dist/.
  const tpl = resolve(here, '..', 'templates', 'starter')

  await copyTree(tpl, dest, { name })
  process.stdout.write(`\nCreated ${name} at ${dest}\n`)
  process.stdout.write(`\nNext steps:\n  cd ${name}\n  npm install\n  npm run dev\n`)
  return 0
}

async function copyTree(src: string, dst: string, vars: Record<string, string>): Promise<void> {
  const entries = await readdir(src)
  await mkdir(dst, { recursive: true })
  for (const entry of entries) {
    const s = join(src, entry)
    const d = join(dst, entry)
    const info = await stat(s)
    if (info.isDirectory()) {
      await copyTree(s, d, vars)
    } else {
      const contents = await readFile(s, 'utf8')
      const replaced = contents.replace(/\{\{(\w+)\}\}/g, (_, k: string) => vars[k] ?? '')
      await writeFile(d, replaced, 'utf8')
    }
  }
  void relative
}

main(process.argv.slice(2)).then(
  (code) => process.exit(code),
  (err) => {
    process.stderr.write(`${err instanceof Error ? (err.stack ?? err.message) : String(err)}\n`)
    process.exit(1)
  },
)
