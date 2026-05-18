import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  build: {
    // Optimize build output
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (/[/\\](react|react-dom|scheduler|react-router|react-router-dom)[/\\]/.test(id)) {
              return 'react-vendor';
            }
            if (/[/\\](lucide-react|sonner)[/\\]/.test(id)) {
              return 'ui-vendor';
            }
          }
          if (id.includes('ResumeTemplatePreview')) {
            return 'resume-preview';
          }
          return undefined;
        },
      },
    },
    // Enable minification (using esbuild - built-in and faster)
    minify: 'esbuild',
    // Note: esbuild doesn't support drop_console directly
    // If you need to remove console.log, consider using a plugin or post-build script
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})
