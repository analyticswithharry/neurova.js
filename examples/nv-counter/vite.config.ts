import { defineConfig } from 'vite'
import neurova from '@neurova/vite-plugin'

export default defineConfig({
  plugins: [neurova({ target: 'runtime' })],
})
