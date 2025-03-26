import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import apiPlugin from "./src/vite-plugin-api";

// https://vite.dev/config/
export default defineConfig({
  // Order of plugins matters - apiPlugin needs to be first to handle API routes before React Router
  plugins: [apiPlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Resolving the alias to the src folder
    },
  },
  server: {
    // Configure CORS for local development
    cors: true,
    // Serve static files from the public directory
    fs: {
      strict: false,
    }
  },
});
