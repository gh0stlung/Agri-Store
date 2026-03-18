import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@/lib': path.resolve(__dirname, 'src/lib'),
      '@': path.resolve(__dirname, './'),
      '@components': path.resolve(__dirname, 'components'),
      '@pages': path.resolve(__dirname, 'pages'),
      '@context': path.resolve(__dirname, 'context'),
      '@services': path.resolve(__dirname, 'services'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  }
});