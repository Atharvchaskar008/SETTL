import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'landing',
  publicDir: 'assets',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
});
