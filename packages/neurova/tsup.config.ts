import { defineConfig } from 'tsup'
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    core: 'src/core.ts',
    ui: 'src/ui.ts',
    backend: 'src/backend.ts',
    ai: 'src/ai.ts',
    runtime: 'src/runtime.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: [
    'react',
    'react-dom',
    'fastify',
    '@fastify/cors',
    '@fastify/helmet',
    '@fastify/jwt',
    'ws',
  ],
  target: 'es2022',
})
