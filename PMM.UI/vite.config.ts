import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/lib/components'),
      '@types': path.resolve(__dirname, './src/types'),
      '@hooks': path.resolve(__dirname, './src/lib/hooks'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },

  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: ['pmm.engzaid.tech'],
  },
});
