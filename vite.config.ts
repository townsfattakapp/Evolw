import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    minify: 'esbuild',
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
