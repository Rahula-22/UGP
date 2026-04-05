import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  cacheDir: path.resolve(process.env.LOCALAPPDATA || process.env.TEMP || '.', 'ugp-vite-cache'),
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    },
    fs: {
      strict: false
    }
  }
})
