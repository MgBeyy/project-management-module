import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/lib/components"),
      "@types": path.resolve(__dirname, "./src/lib/types"),
      "@hooks": path.resolve(__dirname, "./src/lib/hooks"),
      "@lib": path.resolve(__dirname, "./src/lib"),
    },
  },
});
