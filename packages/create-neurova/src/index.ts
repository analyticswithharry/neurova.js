import { spawn } from 'node:child_process'

// Forwards arguments to `neurova init <args>` so users can do:
//   npm create neurova@latest my-app
const args = process.argv.slice(2)
const child = spawn('npx', ['--yes', '@neurova/cli', 'init', ...args], { stdio: 'inherit' })
child.on('exit', (code) => process.exit(code ?? 0))
