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
      "react-router-dom",
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
  },
  build: {
    target: "es2020",
    outDir: "dist",
    assetsDir: "assets",
    minify: "esbuild",
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // CRITICAL: Keep React and react-dom together - they must be in the same chunk
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "react-vendor";
          }
          // React Router must be with React
          if (id.includes("react-router")) {
            return "react-vendor";
          }
          // Separate three.js and related libraries
          if (id.includes("three") || id.includes("@react-three")) {
            return "three-vendor";
          }
          // Separate other large dependencies
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]",
      },
      onwarn(warning, warn) {
        // Suppress specific warnings
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        if (warning.code === "THIS_IS_UNDEFINED") return;
        warn(warning);
      },
    },
    esbuild: {
      target: "es2020",
      legalComments: "none",
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
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
