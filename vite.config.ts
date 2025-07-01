import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      // Proxy API requests to mock service worker
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    },
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  define: {
    __PREVIEW__: mode === "preview",
    __PROD__: mode === "production",
  },
  build: {
    sourcemap: mode !== "production",
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Bundle React and related packages
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router-dom/")
          ) {
            return "react-vendor";
          }

          // Bundle UI-related packages
          if (
            id.includes("node_modules/@radix-ui/") ||
            id.includes("node_modules/lucide-react/") ||
            id.includes("node_modules/next-themes/")
          ) {
            return "ui-vendor";
          }

          // Bundle data management packages
          if (id.includes("node_modules/@tanstack/")) {
            return "data-vendor";
          }

          // Bundle our UI components
          if (id.includes("/src/components/ui/")) {
            return "app-ui";
          }

          // Bundle our model-related code
          if (id.includes("/src/pages/dashboard/models/")) {
            return "models";
          }
        },
      },
    },
  },
  assetsInclude: ["**/*.woff2"],
  // Handle service worker in development
  worker: {
    format: "es",
  },
}));
