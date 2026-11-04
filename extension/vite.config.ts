import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const envDir = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, '');
  return {
    envDir,
    server: {
      host: 'localhost',
      port: 5174,
      strictPort: true,
      ...(env.DEV_TLS_CERT && env.DEV_TLS_KEY ? {
        https: {
          cert: readFileSync(env.DEV_TLS_CERT),
          key: readFileSync(env.DEV_TLS_KEY),
        },
      } : {}),
    },
    plugins: [react({ jsxImportSource: '@emotion/react' })],
    base: './',
    build: {
      rollupOptions: {
        input: ['index.html', 'src/content-script.ts', 'src/background.ts'],
        output: { entryFileNames: '[name].js' },
      },
    },
  };
});
