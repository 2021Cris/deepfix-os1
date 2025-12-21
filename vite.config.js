import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuración optimizada para Vercel y el proyecto deepfix-os1
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    target: 'es2020'
  },
  server: {
    historyApiFallback: true
  }
})
