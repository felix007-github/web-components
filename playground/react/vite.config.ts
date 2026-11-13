import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    dedupe: ["react", "react-dom"],
  },
  // 不参与预构建，直接以源方式由浏览器和打包器处理。
  optimizeDeps: {
    exclude: [
      "@lpcp/icons",
      "@lpcp/components",
      "@lpcp/xml-editor",
      "@lpcp/raw-editor",
    ],
  },
  server: {
    open: false,
    watch: {
      awaitWriteFinish: {
        stabilityThreshold: 1200,
        pollInterval: 100,
      },
    },
  },
});
