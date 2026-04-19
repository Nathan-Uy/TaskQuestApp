import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { fileURLToPath, URL } from "node:url";
import tailwindcss from "@tailwindcss/vite";
import obfuscatorPlugin from "vite-plugin-javascript-obfuscator";

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    obfuscatorPlugin({
      exclude: [/router/, /stores/, /tanstack/, /node_modules/],
      options: {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        stringEncryption: true,
        renameGlobals: false,
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // 👈 your backend
        changeOrigin: true,
      },
    },
  },
});
