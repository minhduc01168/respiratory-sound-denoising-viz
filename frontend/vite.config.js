import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
const PORT = parseInt(process.env.PORT || '3000', 10)
const BACKEND_URL = process.env.VITE_BACKEND_URL || 'http://127.0.0.1:8000'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: PORT,
    proxy: {
      '/api': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/docs': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
      '/openapi.json': {
        target: BACKEND_URL,
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: PORT,
  },
})
