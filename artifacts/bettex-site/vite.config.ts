import path from 'path';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
// @ts-expect-error Native build helper is intentionally JavaScript.
import { seoPlugin } from './scripts/seo.mjs';
// @ts-expect-error Shared build-time formatting adapter.
import { localeFormatPlugin } from './scripts/locale-format-plugin.mjs';

// Local dev/preview defaults; hosted builds (e.g. Vercel) do not need a PORT.
const port = Number(process.env.PORT ?? 5173);

if (!Number.isInteger(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${process.env.PORT}"`);
}

const basePath = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base: basePath,
  plugins: [
    {
      name: 'bettex-local-runtime-no-prebundle',
      configResolved(config) {
        config.optimizeDeps.include = config.optimizeDeps.include?.filter(id => !id.includes('/lib/localized'));
      },
    },
    seoPlugin(basePath),
    localeFormatPlugin(),
    react({ jsxImportSource: '@/lib/localized' }),
    tailwindcss({ optimize: false }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src'),
      '@assets': path.resolve(
        import.meta.dirname,
        '..',
        '..',
        'attached_assets',
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    // This is application code, not a dependency. Prebundling it creates a
    // second locale store and caches old catalogues outside normal HMR.
    exclude: ['@/lib/localized/jsx-runtime', '@/lib/localized/jsx-dev-runtime'],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: '0.0.0.0',
    allowedHosts: true,
    // Opt-in local API proxy for development.
    ...(process.env.BETTEX_LOCAL_API_PROXY
      ? { proxy: { '/api': { target: process.env.BETTEX_LOCAL_API_PROXY, changeOrigin: false } } }
      : {}),
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: '0.0.0.0',
    allowedHosts: true,
  },
});
