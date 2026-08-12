import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    open: '/community',
    proxy: {
      // Local APIs: run `npm run dev:api` (vercel dev on :3000)
      // Or set VITE_API_PROXY=https://www.evolw.in to hit production APIs
      '/api': {
        // Default to production so `npm run dev` can load community data.
        // Override with VITE_API_PROXY=http://127.0.0.1:3000 when using `npm run dev:api`.
        target: process.env.VITE_API_PROXY || 'https://www.evolw.in',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion')) return 'motion'
          if (id.includes('@tiptap') || id.includes('prosemirror')) return 'editor'
          if (id.includes('@react-pdf') || id.includes('html2pdf')) return 'pdf'
          if (id.includes('lucide-react')) return 'icons'
          if (id.includes('react-router') || id.includes('react-dom') || id.includes('/react/')) {
            return 'react-vendor'
          }
        },
      },
    },
  },
})
