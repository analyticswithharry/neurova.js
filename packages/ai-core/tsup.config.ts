import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    tensor: 'src/tensor.ts',
    nn: 'src/nn.ts',
    optim: 'src/optim.ts',
    losses: 'src/losses.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
})
