import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    dedupe: ['vue'],
  },
  optimizeDeps: {
    exclude: [
      "@mache-hangar/icons",
      "@mache-hangar/components",
      "@mache-hangar/xml-editor",
      "@mache-hangar/raw-editor",
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
