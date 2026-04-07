import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-geo': {
        target: 'https://geocoding-api.open-meteo.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-geo/, '')
      },
      '/api-weather': {
        target: 'https://api.open-meteo.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-weather/, '')
      }
    }
  }
})