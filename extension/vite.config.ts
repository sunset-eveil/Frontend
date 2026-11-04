import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react({ jsxImportSource: '@emotion/react' })],
  base: './',
  build: {
    rollupOptions: {
      input: ['index.html', 'src/content-script.ts'],
      output: { entryFileNames: '[name].js' },
    },
  },
});
