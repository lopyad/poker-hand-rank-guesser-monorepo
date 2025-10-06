import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000', 
        changeOrigin: true, 
        // rewrite: (path) => path.replace(/^\/api/, ''), 
      }
    },
    allowedHosts: [
      "nonindexed-unprophetically-alysia.ngrok-free.dev"
    ]
  },
  build: {
    outDir: path.resolve(__dirname, '../server/public'),
    emptyOutDir: true,
  }
})
