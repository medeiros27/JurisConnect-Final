import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '5173-inlumz87km119nogpbn88-93e43c32.manusvm.computer',
      '.manusvm.computer'
    ],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['lucide-react', 'react-hot-toast'],
          utils: ['axios', 'date-fns', 'clsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
})

