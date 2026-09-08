import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  base: '/produto/',
  plugins: [stylex.vite({ useCSSLayers: true }), react()],
  server: { proxy: { '/api': process.env.PHB_DEV_API || 'http://127.0.0.1:8000' } },
});
