import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    host: '127.0.0.1',
    port: 3001,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000/",
        changeOrigin: true,
      },
      "/broadcasting/auth": {
        target: "http://127.0.0.1:8000/",
        changeOrigin: true,
      },
    },
    "/api/zalopay/callback": {
      target: "https://mlatbooking.serveo.net",
      changeOrigin: true,
    },
  },
});
