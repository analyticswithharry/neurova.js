export default function Page() {
  return (
    <article>
      <h1>@neurova/core</h1>
      <p>Foundational utilities used by every neurova package.</p>

      <h2>Errors</h2>
      <pre>{`import { NeurovaError, ValidationError, isNeurovaError } from '@neurova/core'

throw new ValidationError('email is required')`}</pre>

      <h2>Logger</h2>
      <pre>{`import { logger, createLogger } from '@neurova/core'

logger.info('hello', { userId: 1 })
const log = createLogger({ name: 'my-svc', level: 'debug' })`}</pre>

      <h2>Schema (zod)</h2>
      <pre>{`import { z, parse, safeParse } from '@neurova/core'

const User = z.object({ id: z.string(), email: z.string().email() })
const user = parse(User, input) // throws ValidationError
const [ok, value] = safeParse(User, input)`}</pre>

      <h2>IDs</h2>
      <pre>{`import { id, uuid, shortId } from '@neurova/core'

id('user') // user_01HZ...   (ULID)
uuid()      // RFC 4122
shortId()   // 8-char base36`}</pre>

      <h2>Events</h2>
      <pre>{`import { EventBus } from '@neurova/core'

const bus = new EventBus<{ ready: void; error: Error }>()
bus.on('ready', () => {})
bus.emit('ready')`}</pre>

      <h2>Result</h2>
      <pre>{`import { tryCatch, tryCatchAsync, Ok, Err } from '@neurova/core'

const r = tryCatch(() => JSON.parse(input))
if (r.ok) console.log(r.value); else console.error(r.error)`}</pre>
    </article>
  )
}
