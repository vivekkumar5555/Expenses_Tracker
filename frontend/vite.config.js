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
    // Disable minification completely to prevent initialization errors
    minify: false,
    sourcemap: false,
    chunkSizeWarningLimit: 3000,
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
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
