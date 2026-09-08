import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import stylex from '@stylexjs/unplugin';

export default defineConfig({
  // Mesmo compilador, sem o servidor de HMR de CSS (Vitest não abre httpServer).
  plugins: [stylex.rollup({ useCSSLayers: true, devMode: 'css-only' }), react()],
  test: { environment: 'node', testTimeout: 15000, hookTimeout: 15000, setupFiles: ['./src/test/setup.ts'] },
});
