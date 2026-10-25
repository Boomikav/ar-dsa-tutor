import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { aiBackendVitePlugin } from './server/vitePlugin'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), aiBackendVitePlugin()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})

