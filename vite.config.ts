import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths'; // Import the plugin

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      exclude: [/\.worker\.(ts|js)$/, /src\/components\/pdf\/PostPdf/, /src\/components\/pdf\/CommentPdf/],
    }),
    tailwindcss(),
    tsconfigPaths(),
    nodePolyfills({
      // Polyfills
      globals: {
        Buffer: true, // can also be 'build', 'dev', or true
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, './src/common'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@features': path.resolve(__dirname, './src/features'),
      '@models': path.resolve(__dirname, './src/models'),
      // Worker bundles inherit `resolve` but NOT `plugins`, so tsconfigPaths()
      // never runs for them — @enums has to be a real alias or the worker build
      // fails to resolve it (userDataWorker -> agent -> stores -> @enums).
      '@enums': path.resolve(__dirname, './src/models/enums.ts'),
      "@typings": path.resolve(__dirname, 'typings.d.ts'),
      'typings.d': path.resolve(__dirname, 'typings.d.ts'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@webWorkers': path.resolve(__dirname, './src/webWorkers'),
      '@animatedIcons': path.resolve(__dirname, './src/animated-icons')
    },
  },
  server: {
    cors: true,
    proxy: {
      '/api': {
        changeOrigin: true,
        target: 'https://api.alsaqr.app/', // your backend server URL
        // target: "https://localhost:32769/",
        secure: false
      },
    },
  },
  worker: {
    format: 'es', // Change from the default 'iife' to 'es'
  },
})
