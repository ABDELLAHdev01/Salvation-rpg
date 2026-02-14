import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import viteCompression from 'vite-plugin-compression'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),

    // Brotli compression (better than gzip, ~20% smaller)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240, // Only compress files > 10KB
      deleteOriginFile: false,
    }),

    // Gzip compression (fallback for older browsers)
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240,
      deleteOriginFile: false,
    }),

    // Bundle visualizer - generates stats.html after build
    visualizer({
      open: false, // Set to true to auto-open after build
      gzipSize: true,
      brotliSize: true,
      filename: 'dist/stats.html',
    }),
  ],

  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,

    // Enable CSS code splitting
    cssCodeSplit: true,

    // Minification (esbuild is faster, terser is more aggressive)
    minify: 'esbuild',

    rollupOptions: {
      output: {
        // Enhanced manual chunk strategy for better caching
        manualChunks(id) {
          // Application code - group by feature
          if (!id.includes('node_modules')) {
            // Feature-based chunking
            if (id.includes('/features/mining/')) return 'feature-mining';
            if (id.includes('/features/farm/')) return 'feature-farm';
            if (id.includes('/features/workshop/')) return 'feature-workshop';
            if (id.includes('/features/combat/')) return 'feature-combat';
            if (id.includes('/features/adventure/')) return 'feature-adventure';
            if (id.includes('/features/market/')) return 'feature-market';
            if (id.includes('/features/dashboard/')) return 'feature-dashboard';

            // Shared code chunking
            if (id.includes('/shared/ui/')) return 'shared-ui';
            if (id.includes('/shared/layout/')) return 'shared-layout';

            // Core code chunking
            if (id.includes('/core/data/')) return 'core-data';
            if (id.includes('/core/services/')) return 'core-services';

            return undefined;
          }

          // Vendor splitting for better caching
          if (id.includes('react-router')) return 'router';
          if (id.includes('react-dom')) return 'react-dom';
          if (id.includes('react') && !id.includes('react-dom') && !id.includes('react-router')) {
            return 'react';
          }
          if (id.includes('@heroicons')) return 'icons';
          if (id.includes('react-hot-toast')) return 'toast';
          if (id.includes('@vercel/analytics') || id.includes('@vercel/speed-insights')) {
            return 'analytics';
          }

          // Everything else goes to vendor
          return 'vendor';
        },

        // Consistent naming for better long-term caching
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },

  // Optimize dependencies pre-bundling
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@heroicons/react',
      'react-hot-toast',
    ],
  },
})
