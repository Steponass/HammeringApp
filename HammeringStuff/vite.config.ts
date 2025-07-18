import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'components': '/src/components',
      'hooks': '/src/hooks',
      'types': '/src/types',
      'utils': '/src/utils',
      'assets': '/src/assets',
      'data': '/src/data',
      'styles': '/src/styles',
    },
  },
  server: {
    port: 3000,
    open: true
  }
})