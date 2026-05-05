import { defineConfig } from 'tsup'
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    chat: 'src/chat.ts',
    embed: 'src/embed.ts',
    vector: 'src/vector.ts',
    rag: 'src/rag.ts',
    agents: 'src/agents.ts',
    tracing: 'src/tracing.ts',
    'providers/index': 'src/providers/index.ts',
  },
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  treeshake: true,
  target: 'es2022',
})
