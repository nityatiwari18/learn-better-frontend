import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    sourcemapIgnoreList: false
  },
  build: {
    sourcemap: true
  },
  // Enable source maps in development for debugging
  css: {
    devSourcemap: true
  }
})

