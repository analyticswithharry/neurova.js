import jwt from '@fastify/jwt'
import { UnauthorizedError } from '@neurova/core'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

export interface AuthOptions {
  secret: string
  /** Cookie name to also accept the token from. */
  cookieName?: string
  /** Algorithm. Default HS256. */
  algorithm?: 'HS256' | 'HS384' | 'HS512' | 'RS256'
}

export async function registerAuth(app: FastifyInstance, opts: AuthOptions): Promise<void> {
  await app.register(jwt, {
    secret: opts.secret,
    sign: { algorithm: opts.algorithm ?? 'HS256' },
  })

  app.decorate('authenticate', async (req: FastifyRequest, _reply: FastifyReply) => {
    try {
      await req.jwtVerify()
    } catch {
      throw new UnauthorizedError()
    }
  })
}

export interface SignOptions {
  expiresIn?: string | number
}

declare module 'fastify' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface FastifyInstance {
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>
  }
}

export type { SignOptions as JwtSignOptions }
