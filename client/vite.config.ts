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
        manualChunks: id => {
          // Split node_modules into vendor chunks
          if (id.includes("node_modules")) {
            // Framer Motion - animation library (split first due to large size)
            if (id.includes("framer-motion")) {
              return "framer-motion";
            }

            // Recharts - heavy charting library
            if (id.includes("recharts")) {
              return "charts";
            }

            // Leaflet - map library (if used)
            if (id.includes("leaflet") || id.includes("react-leaflet")) {
              return "maps";
            }

            // Core React ecosystem (small, frequently used)
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }

            // Router
            if (id.includes("wouter")) {
              return "vendor-router";
            }

            // React Query and tRPC
            if (
              id.includes("@tanstack/react-query") ||
              id.includes("@trpc/client") ||
              id.includes("@trpc/react-query")
            ) {
              return "vendor-query";
            }

            // Radix UI components (split by package to reduce size)
            if (id.includes("@radix-ui/react-avatar")) {
              return "ui-avatar";
            }
            if (id.includes("@radix-ui/react-select")) {
              return "ui-select";
            }
            if (id.includes("@radix-ui/react-tooltip")) {
              return "ui-tooltip";
            }
            if (id.includes("@radix-ui")) {
              return "ui-radix";
            }

            // Lucide icons (can be large)
            if (id.includes("lucide-react")) {
              return "icons";
            }

            // Date utilities
            if (id.includes("date-fns")) {
              return "date-utils";
            }

            // Other vendor libraries
            return "vendor-other";
          }

          // Split large local components
          if (id.includes("/components/charts/")) {
            return "charts";
          }
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
        target: "http://localhost:3000",
        changeOrigin: true,
      },
      "/trpc": {
        target: "http://localhost:3000",
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
