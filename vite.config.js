import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    cssMinify: 'esbuild', // Ensures fast CSS minification
    chunkSizeWarningLimit: 1500, // Increase from default 500 KB
  },
})