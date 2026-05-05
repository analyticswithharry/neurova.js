import { defineConfig } from 'tsup'

export default defineConfig({
  entry: { index: 'src/index.ts', 'jsx-runtime': 'src/jsx-runtime.ts' },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
})
