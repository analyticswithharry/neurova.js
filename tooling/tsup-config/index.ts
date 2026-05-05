import { defineConfig } from 'tsup'

export const baseConfig = defineConfig({
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  splitting: false,
  minify: false,
  target: 'es2022',
})

export default baseConfig
