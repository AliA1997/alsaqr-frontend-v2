import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react'
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()], 
  resolve: {
    alias: {
      '@common': path.resolve(__dirname, './src/common'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@features': path.resolve(__dirname, './src/features'),
      '@models': path.resolve(__dirname, './src/models'),
      "@typings": path.resolve(__dirname, 'typings.d.ts'),
      'typings.d': path.resolve(__dirname, 'typings.d.ts'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@stores': path.resolve(__dirname, './src/stores')
    },
  },
  server: {
    cors: false,
    proxy: {
       '/api': {
        changeOrigin: true,
         target: 'https://alsaqr.netlify.app', // your backend server URL
         secure: false
       },
   },
  }
})
