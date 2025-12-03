import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: "automatic",
    }),
  ],
  server: {
    port: 3000,
    host: "0.0.0.0",
    strictPort: false,
    open: false,
    proxy: {
      "/api": {
        target:
          "https://expenses-tracker-server-mvkm.onrender.com" ||
          "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "react-router-dom",
      "react-hook-form",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "framer-motion",
      "axios",
      "recharts",
    ],
    exclude: [],
    esbuildOptions: {
      target: "es2020",
      supported: {
        "top-level-await": true,
      },
    },
    force: true,
  },
  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    // Use terser with safe settings
    minify: "terser",
    sourcemap: false,
    chunkSizeWarningLimit: 2000,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: true,
        // Don't hoist or reorder code that could break initialization
        hoist_funs: false,
        hoist_vars: false,
        passes: 1, // Single pass to avoid aggressive optimizations
      },
      format: {
        comments: false,
        // Preserve variable names to avoid conflicts
        preserve_annotations: true,
      },
      // CRITICAL: Don't mangle names to prevent initialization errors
      mangle: false,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // CRITICAL: Keep ALL React ecosystem together
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react-vendor";
          }
          // Keep Three.js ecosystem together
          if (
            id.includes("node_modules/three/") ||
            id.includes("node_modules/@react-three")
          ) {
            return "three-vendor";
          }
          // Keep animation libraries together
          if (id.includes("node_modules/framer-motion")) {
            return "animation-vendor";
          }
          // CRITICAL: Keep recharts AND ALL d3 libraries together
          // This prevents circular dependency initialization issues
          if (
            id.includes("node_modules/recharts") ||
            id.includes("node_modules/d3-") ||
            id.includes("node_modules/d3/")
          ) {
            return "chart-vendor";
          }
          // Keep axios separate
          if (id.includes("node_modules/axios")) {
            return "http-vendor";
          }
          // All other vendor code in one chunk
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
        // Larger chunks to prevent over-splitting
        experimentalMinChunkSize: 50000,
      },
      onwarn(warning, warn) {
        // Suppress specific warnings
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        if (warning.code === "THIS_IS_UNDEFINED") return;
        if (warning.code === "CIRCULAR_DEPENDENCY") {
          // Circular deps are handled by grouping
          return;
        }
        warn(warning);
      },
    },
  },
  publicDir: "public",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom"],
  },
});
