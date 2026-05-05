import { defineConfig } from 'tsup'
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    server: 'src/server.ts',
    auth: 'src/auth.ts',
    cache: 'src/cache.ts',
    queue: 'src/queue.ts',
    socket: 'src/socket.ts',
    'rate-limit': 'src/rate-limit.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'node20',
  external: ['fastify', '@fastify/cors', '@fastify/helmet', '@fastify/jwt', 'ws'],
})
