import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    errors: 'src/errors.ts',
    logger: 'src/logger.ts',
    schema: 'src/schema.ts',
    id: 'src/id.ts',
    events: 'src/events.ts',
    result: 'src/result.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  target: 'es2022',
})
