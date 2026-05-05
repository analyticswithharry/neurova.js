export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

const LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
}

export interface Logger {
  level: LogLevel
  child(bindings: Record<string, unknown>): Logger
  trace(msg: string, data?: Record<string, unknown>): void
  debug(msg: string, data?: Record<string, unknown>): void
  info(msg: string, data?: Record<string, unknown>): void
  warn(msg: string, data?: Record<string, unknown>): void
  error(msg: string, data?: Record<string, unknown>): void
  fatal(msg: string, data?: Record<string, unknown>): void
}

export interface LoggerOptions {
  level?: LogLevel
  name?: string
  bindings?: Record<string, unknown>
  /** Override the sink. Defaults to console (pretty in TTY, JSON otherwise). */
  sink?: (entry: LogEntry) => void
}

export interface LogEntry {
  time: string
  level: LogLevel
  name?: string
  msg: string
  bindings?: Record<string, unknown>
  data?: Record<string, unknown>
}

const isTTY = (() => {
  try {
    return typeof process !== 'undefined' && Boolean(process.stdout?.isTTY)
  } catch {
    return false
  }
})()

const COLORS: Record<LogLevel, string> = {
  trace: '\x1b[90m',
  debug: '\x1b[36m',
  info: '\x1b[32m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
  fatal: '\x1b[35m',
}
const RESET = '\x1b[0m'

function defaultSink(entry: LogEntry): void {
  if (isTTY) {
    const c = COLORS[entry.level]
    const tag = `${c}${entry.level.toUpperCase().padEnd(5)}${RESET}`
    const name = entry.name ? ` [${entry.name}]` : ''
    const data = entry.data ? ` ${JSON.stringify(entry.data)}` : ''
    // eslint-disable-next-line no-console
    console.log(`${entry.time} ${tag}${name} ${entry.msg}${data}`)
  } else {
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(entry))
  }
}

export function createLogger(options: LoggerOptions = {}): Logger {
  const level: LogLevel = options.level ?? 'info'
  const name = options.name
  const bindings = options.bindings
  const sink = options.sink ?? defaultSink
  const threshold = LEVELS[level]

  const log = (lvl: LogLevel, msg: string, data?: Record<string, unknown>) => {
    if (LEVELS[lvl] < threshold) return
    sink({ time: new Date().toISOString(), level: lvl, name, msg, bindings, data })
  }

  return {
    level,
    child: (extra) => createLogger({ ...options, bindings: { ...bindings, ...extra } }),
    trace: (m, d) => log('trace', m, d),
    debug: (m, d) => log('debug', m, d),
    info: (m, d) => log('info', m, d),
    warn: (m, d) => log('warn', m, d),
    error: (m, d) => log('error', m, d),
    fatal: (m, d) => log('fatal', m, d),
  }
}

export const logger = createLogger({ name: 'neurova' })
