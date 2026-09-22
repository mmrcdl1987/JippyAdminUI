import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,

    watch: {
      // Prevent Vite from watching files that should not trigger
      // unnecessary server restarts.
      ignored: [
        '**/.git/**',
        '**/node_modules/**',
        '**/dist/**',
        '**/.DS_Store',
      ],
    },
  },
})