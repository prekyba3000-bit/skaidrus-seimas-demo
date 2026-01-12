import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import tailwindcss from "@tailwindcss/vite";

/**
 * Vite Configuration - Production Optimized
 *
 * Performance features:
 * - Code splitting with manual chunks
 * - Tree shaking
 * - Minification with esbuild
 * - Asset compression
 * - Prefetching for routes
 */

export default defineConfig({
  root: path.resolve(__dirname), // Set root to client directory where index.html is located
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    // Target modern browsers
    target: "es2022",

    // Minification settings
    minify: "esbuild",

    // Source maps for error tracking (production)
    sourcemap: true,

    // CSS code splitting
    cssCodeSplit: true,

    // Chunk size warning threshold (500KB)
    chunkSizeWarningLimit: 500,

    // Rollup options for code splitting
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: {
          // Vendor chunks - rarely change
          "vendor-react": ["react", "react-dom"],
          "vendor-router": ["wouter"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-trpc": ["@trpc/client", "@trpc/react-query"],
          "vendor-ui": [
            "@radix-ui/react-avatar",
            "@radix-ui/react-select",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-progress",
          ],

          // Feature chunks - change together
          "feature-dashboard": [
            path.resolve(__dirname, "./src/pages/Dashboard.tsx"),
            path.resolve(__dirname, "./src/pages/Home.tsx"),
          ],
          "feature-mps": [
            path.resolve(__dirname, "./src/pages/MPs.tsx"),
            path.resolve(__dirname, "./src/pages/MPProfile.tsx"),
            path.resolve(__dirname, "./src/pages/MpCompare.tsx"),
          ],
          "feature-bills": [
            path.resolve(__dirname, "./src/pages/Bills.tsx"),
            path.resolve(__dirname, "./src/pages/BillDetail.tsx"),
          ],
        },

        // Asset naming for caching
        assetFileNames: assetInfo => {
          const info = assetInfo.name?.split(".");
          const ext = info?.[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || "")) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/woff2?|eot|ttf|otf/i.test(ext || "")) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },

        // Chunk naming
        chunkFileNames: "js/[name]-[hash].js",
        entryFileNames: "js/[name]-[hash].js",
      },
    },
  },

  // Development server
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
      },
      "/trpc": {
        target: "http://localhost:3002",
        changeOrigin: true,
      },
    },
  },

  // Preview server (production build testing)
  preview: {
    port: 4173,
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "wouter",
      "@tanstack/react-query",
      "lucide-react",
    ],
    exclude: ["@vite/client"],
  },

  // Enable experimental features
  esbuild: {
    // Drop console.log in production
    drop: process.env.NODE_ENV === "production" ? ["console", "debugger"] : [],
  },
});
