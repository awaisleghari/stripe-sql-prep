import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// Static SPA. No backend, no env vars required. Builds to ./dist for Cloudflare Pages.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  // PGlite ships its own WASM and must not be pre-bundled by esbuild. It is only ever reached
  // via a dynamic import() from the SQL console, so Rollup code-splits it into its own chunk.
  optimizeDeps: { exclude: ['@electric-sql/pglite'] },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split heavy vendors so no single chunk trips the 500 kB warning and so
        // they cache independently of app code.
        manualChunks: {
          mantine: ['@mantine/core', '@mantine/hooks'],
          icons: ['@tabler/icons-react'],
        },
      },
    },
  },
  test: {
    // Vitest unit tests run in Node. The store is written to be node-safe (no jsdom needed).
    // UI render tests opt into jsdom per-file via `// @vitest-environment jsdom`.
    environment: 'node',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    exclude: ['tests/e2e/**'],
  },
});
