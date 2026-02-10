import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Questa parte è utile per Netlify per assicurarsi che i percorsi siano corretti
  base: '/',
  build: {
    outDir: 'dist',
  }
})