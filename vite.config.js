import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'

export default defineConfig({
  plugins: [react()],
  // GitHub Pages serves from /<repo-name>/. The deploy workflow sets BASE; local dev stays at '/'.
  base: process.env.BASE || '/',
  resolve: { alias: { '@': path.resolve(import.meta.dirname, 'src') } },
  build: { chunkSizeWarningLimit: 1500 },
})
