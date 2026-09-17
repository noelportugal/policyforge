import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// BASE_PATH lets the same build serve from a domain root or a GitHub Pages
// sub-path (e.g. /policyforge/) without any source changes.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
  },
})
