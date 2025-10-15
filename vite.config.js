import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.js',
    reporters: process.env.CI ? ['default', 'junit'] : ['default'],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    include: [],
    exclude: [...configDefaults.exclude, 'test/logs/**'],
    coverage: {
      reporter: ['text', 'lcov'],
      reportsDirectory: './test/coverage',
      include: ['src/**/*.{js,jsx,ts,tsx}'],
    },
    projects: [
      {
        name: 'unit',
        include: ['src/**/*.{test,spec}.{js,jsx,ts,tsx}'],
        environment: 'jsdom',
        setupFiles: './test/setupTests.js',
      },
      {
        name: 'integration',
        include: ['test/integration/**/*.test.{js,jsx,ts,tsx}'],
        environment: 'jsdom',
        setupFiles: './test/setupTests.js',
        sequence: { concurrent: false },
      },
      {
        name: 'e2e',
        include: ['test/e2e/**/*.test.{js,jsx,ts,tsx}'],
        environment: 'jsdom',
        setupFiles: './test/setupTests.js',
        testTimeout: 30000,
        hookTimeout: 10000,
        sequence: { concurrent: false },
        pool: 'threads',
        poolOptions: {
          threads: {
            minThreads: 1,
            maxThreads: 1,
          },
        },
      },
    ],
  },
})
