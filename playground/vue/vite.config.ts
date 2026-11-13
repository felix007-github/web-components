import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue'],
  },
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
