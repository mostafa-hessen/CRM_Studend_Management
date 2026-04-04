import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // Simulate the browser
    globals: true, // Support Jest-like globals (describe, it, etc.)
  },
});
