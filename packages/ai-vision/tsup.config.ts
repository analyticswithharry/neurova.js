import { defineConfig } from 'tsup'
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'io-browser': 'src/io-browser.ts',
    'io-node': 'src/io-node.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  external: ['sharp'],
})
