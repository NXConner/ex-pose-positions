import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [
          // Optimize React for production
          ...(process.env.NODE_ENV === 'production' ? [] : [])
        ]
      }
    }),
    tailwindcss(),
    tsconfigPaths()
  ],
  base: "/",
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: process.env.NODE_ENV === 'development', // Enable sourcemaps in dev
    cssCodeSplit: true, // Split CSS for better caching
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('firebase')) {
              return 'vendor-firebase';
            }
            if (id.includes('react-switch')) {
              return 'vendor-ui';
            }
            // Other vendor libraries
            return 'vendor-misc';
          }
          // Component chunks for better code splitting
          if (id.includes('/components/') && id.includes('.tsx')) {
            const componentName = id.split('/components/')[1]?.split('.')[0];
            // Group large components separately
            if (componentName && ['enhanced-game', 'enhanced-partner-connection', 'positions-gallery'].includes(componentName)) {
              return `component-${componentName}`;
            }
            return 'components';
          }
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[ext]/[name]-[hash].[ext]";
        },
      },
    },
    chunkSizeWarningLimit: 500, // Lower threshold for bundle size warnings
    reportCompressedSize: true, // Report gzipped sizes
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router", "firebase"],
    exclude: [],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  server: {
    hmr: {
      overlay: true
    }
  },
  preview: {
    port: 4173,
    strictPort: true
  }
});
