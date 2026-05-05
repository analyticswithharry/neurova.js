import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import { isNeurovaError, logger as defaultLogger } from '@neurova/core'

export interface CreateServerOptions extends FastifyServerOptions {
  cors?: boolean | Parameters<typeof cors>[1]
  helmet?: boolean | Parameters<typeof helmet>[1]
  /** Custom request id header name. */
  requestIdHeader?: string
}

export type Server = FastifyInstance

/**
 * Creates a hardened Fastify server pre-wired with cors, helmet, structured
 * error handling, and neurova error mapping.
 */
export async function createServer(options: CreateServerOptions = {}): Promise<Server> {
  const { cors: corsOpts = true, helmet: helmetOpts = true, requestIdHeader = 'x-request-id', ...fastifyOpts } =
    options

  const app = Fastify({
    logger: { level: 'info' },
    requestIdHeader,
    disableRequestLogging: false,
    ...fastifyOpts,
  })

  if (corsOpts) await app.register(cors, corsOpts === true ? {} : corsOpts)
  if (helmetOpts) await app.register(helmet, helmetOpts === true ? {} : helmetOpts)

  app.setErrorHandler((err: Error, _req, reply) => {
    if (isNeurovaError(err)) {
      reply.status(err.status).send(err.toJSON())
      return
    }
    defaultLogger.error(err.message, { stack: err.stack })
    reply.status(500).send({ code: 'INTERNAL', message: 'Internal Server Error' })
  })

  app.get('/health', async () => ({ ok: true, ts: Date.now() }))

  return app
}

export async function startServer(
  app: Server,
  port = Number(process.env.PORT ?? 3000),
  host = process.env.HOST ?? '0.0.0.0',
): Promise<string> {
  return app.listen({ port, host })
}
