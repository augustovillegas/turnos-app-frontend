/* eslint-env node */
/* global process */
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

const isCI = typeof process !== 'undefined' && process.env?.CI

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.js',
    reporters: [['default', { summary: false }]],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    include: [
      'src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      'test/integration/**/*.test.{js,jsx,ts,tsx}',
      'test/e2e/**/*.test.{js,jsx,ts,tsx}',
    ],
    exclude: [...configDefaults.exclude, 'test/logs/**'],
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './test/coverage',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
    },
    testTimeout: 30_000,
    hookTimeout: 10_000,
    sequence: {
      concurrent: false,
    },
    pool: 'threads',
    poolOptions: {
      threads: {
        minThreads: 1,
        maxThreads: 1,
      },
    },
  },
})
