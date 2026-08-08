import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: false,
    environment: 'node',
    include: [
      'packages/**/__tests__/**/*.test.ts',
      'apps/**/__tests__/**/*.test.ts',
    ],
  },
  resolve: {
    alias: {
      '@isekai/contracts': resolve(__dirname, 'packages/contracts/src'),
      '@isekai/game-core': resolve(__dirname, 'packages/game-core/src'),
      '@isekai/ai-core': resolve(__dirname, 'packages/ai-core/src'),
    },
  },
});
