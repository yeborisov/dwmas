import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Prefer TS/TSX source files over stale compiled JS files in src/
    extensions: ['.tsx', '.ts', '.jsx', '.js', '.json']
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true
  }
});
