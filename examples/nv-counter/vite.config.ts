import neurova from '@neurova/vite-plugin'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [neurova({ target: 'runtime' })],
})
