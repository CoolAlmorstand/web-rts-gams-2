import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom', // so document/Image works
  },
  resolve: {
    alias: {
      // THIS MUST MATCH your Vite alias
      $lib: path.resolve(__dirname, 'src/lib'),
    },
  },
})