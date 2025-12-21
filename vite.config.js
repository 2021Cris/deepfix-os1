import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Configuración optimizada para despliegues en Vercel.
 * Se define la base como '/' para asegurar que las rutas sean absolutas y correctas.
 */
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    // Target es2020 para compatibilidad con variables de entorno modernas
    target: 'es2020'
  },
  server: {
    historyApiFallback: true
  }
})
