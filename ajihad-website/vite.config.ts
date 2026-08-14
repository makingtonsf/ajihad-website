import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig(({ mode }) => ({
  // GitHub Pages sert ce projet sous /ajihad-website/ ; en local on reste à la racine.
  base: process.env.VITE_BASE_PATH ?? "/",
  plugins: [
    react(),
    tailwindcss(),
    ...(mode === "development" ? [jsxLocPlugin()] : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    // Hôtes autorisés à joindre le serveur de développement. Les domaines de
    // tunnel servent aux préversions partagées ; à retirer si inutiles.
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      ".trycloudflare.com",
      ".lhr.life",
      ".ngrok-free.app",
    ],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
}));
