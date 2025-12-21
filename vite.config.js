import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Configuración optimizada para despliegues en Vercel.
 */
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
