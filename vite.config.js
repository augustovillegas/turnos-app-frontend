/* eslint-env node */
import { defineConfig } from 'vite'
import { configDefaults } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

const requiredRemoteCreds = [
  'TEST_E2E_ALUMNO_EMAIL',
  'TEST_E2E_ALUMNO_PASSWORD',
  'TEST_E2E_PROFESOR_EMAIL',
  'TEST_E2E_PROFESOR_PASSWORD',
  'TEST_E2E_SUPERADMIN_EMAIL',
  'TEST_E2E_SUPERADMIN_PASSWORD',
]

const hasRemoteCreds = requiredRemoteCreds.every((key) => Boolean(process.env[key]))
const runRemoteTests =
  process.env.RUN_E2E === 'true' ||
  process.env.RUN_REMOTE_TESTS === 'true' ||
  (!process.env.CI && hasRemoteCreds)

const unitIncludes = ['src/**/*.{test,spec}.{js,jsx,ts,tsx}']
const remoteIncludes = [
  'test/integration/**/*.test.{js,jsx,ts,tsx}',
  'test/e2e/**/*.test.{js,jsx,ts,tsx}',
]
const activeIncludes = runRemoteTests ? [...unitIncludes, ...remoteIncludes] : unitIncludes

function forbidE2EVars() {
  return {
    name: 'forbid-e2e-vars',
    apply: 'serve',
    configureServer(server) {
      const scan = () => scanClient()
      server.watcher.on('ready', scan)
      server.watcher.on('add', scan)
      server.watcher.on('change', scan)
    },
    buildStart() {
      scanClient()
    },
  }
}

function scanClient() {
  const root = process.cwd()
  const srcDir = path.join(root, 'src')
  const forbidden = [/TEST_E2E_/]
  const files = walk(srcDir)
  for (const f of files) {
    const content = fs.readFileSync(f, 'utf8')
    for (const re of forbidden) {
      if (re.test(content)) {
        const rel = path.relative(root, f)
        throw new Error(`Forbidden TEST_E2E_* vars in client code: ${rel}`)
      }
    }
  }
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const e of entries) {
    if (e.name.startsWith('.') || e.name === 'node_modules') continue
    const full = path.join(dir, e.name)
    if (e.isDirectory()) files.push(...walk(full))
    else if (/\.(jsx?|tsx?|css|mjs|cjs)$/i.test(e.name)) files.push(full)
  }
  return files
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), forbidE2EVars()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './test/setupTests.js',
    server: {
      deps: {
        inline: ['vitest-canvas-mock']
      }
    },
    reporters: [
      ['default', { summary: false }],
      'json'
    ],
    clearMocks: true,
    restoreMocks: true,
    unstubGlobals: true,
    unstubEnvs: true,
    include: activeIncludes,
    exclude: [
      ...configDefaults.exclude,
      'test/logs/**',
      ...(runRemoteTests ? [] : ['test/e2e/**', 'test/integration/**']),
    ],
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
        singleThread: false,
        isolate: true,
      },
    },
  },
})
