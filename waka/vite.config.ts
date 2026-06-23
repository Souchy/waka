import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import aurelia from '@aurelia/vite-plugin';

export default defineConfig({
  base: process.env.VITE_BASE,
  server: {
    open: false,
    port: 9001,
    strictPort: false,
    proxy: {
      '/gamedata': {
        target: 'https://wakfu.cdn.ankama.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  esbuild: {
    target: 'es2022'
  },
  build: {

    // don't minify for debug builds
    minify: process.env.TAURI_ENV_DEBUG ? false : 'esbuild',
    // produce sourcemaps for debug builds
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2022',
    },
  },
  resolve: {
    alias: {
      src: "/src",
    },
  },
  plugins: [
    aurelia({
      useDev: true,
    }),
    nodePolyfills(),
  ],
});
