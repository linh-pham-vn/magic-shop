import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ command }) => ({
  // GitHub Pages serves the app from /magic-shop/; the dev server stays at /.
  base: command === 'build' ? '/magic-shop/' : '/',
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'node',
  },
}));
