/* eslint-env node */
/* global process */
// Load environment variables for tests (prioritize E2E locals)
import { config } from 'dotenv'
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const e2eEnv = path.join(root, '.env.e2e.local')
const testEnv = path.join(root, '.env.test.local')
const defaultEnv = path.join(root, '.env')

if (fs.existsSync(e2eEnv)) {
  config({ path: e2eEnv })
} else if (fs.existsSync(testEnv)) {
  config({ path: testEnv })
} else if (fs.existsSync(defaultEnv)) {
  config({ path: defaultEnv })
} else {
  config()
}

import "@testing-library/jest-dom/vitest";
import { configure as configureTestingLibrary } from "@testing-library/dom";
import React from "react";
import { cleanup } from "@testing-library/react";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach, vi } from "vitest";
import { unstable_setFutureFlags } from "react-router";

if (typeof unstable_setFutureFlags === "function") {
  unstable_setFutureFlags({
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  });
}

const LOG_DIR = resolve(process.cwd(), "test", "logs");
const LOG_FILE = resolve(LOG_DIR, "test-run.log");

let isLogInitialised = false;
const taskStartTimes = new Map();

const sanitizeUrl = (value) => value?.replace(/\/+$/, "") ?? "";

const configuredBase = sanitizeUrl(process.env.VITE_API_BASE_URL || "");
if (!configuredBase) {
  throw new Error(
    "[setupTests] Debes definir VITE_API_BASE_URL para ejecutar las pruebas (sin fallback)."
  );
}
const activeBaseUrl = configuredBase;

process.env.VITE_API_BASE_URL = activeBaseUrl;
process.env.TEST_USE_REAL_API = "true";

vi.stubEnv("VITE_API_BASE_URL", activeBaseUrl);
vi.stubEnv("TEST_USE_REAL_API", "true");

if (typeof globalThis.React === "undefined") {
  globalThis.React = React;
}

const remoteTestsFlag =
  process.env.RUN_REMOTE_TESTS === "true" ? "true" : "false";
const backendModeLabel = "REAL";

// Aumentar timeout para utilidades async (findBy/waitFor) con API real
configureTestingLibrary({ asyncUtilTimeout: 12_000 });

const ensureLogFile = () => {
  if (isLogInitialised) return;
  mkdirSync(LOG_DIR, { recursive: true });
  writeFileSync(
    LOG_FILE,
    `\n=== Nueva ejecucion de pruebas: ${new Date().toISOString()} ===\n` +
      `Backend: ${backendModeLabel} | BaseURL: ${activeBaseUrl}\n` +
      `RUN_REMOTE_TESTS=${remoteTestsFlag}\n`,
    { flag: "a" }
  );
  isLogInitialised = true;
};

const logLine = (message) => {
  ensureLogFile();
  appendFileSync(LOG_FILE, `${new Date().toISOString()} | ${message}\n`);
};

const isTestTask = (task) =>
  Boolean(task) && (task.type === "test" || task?.meta?.type === "test");

// --- Mock de localStorage/sessionStorage para entorno Node ---
const createStorageMock = () => {
  let store = new Map();
  return {
    getItem: (key) => {
      const value = store.get(String(key));
      return value === undefined ? null : value;
    },
    setItem: (key, value) => {
      store.set(String(key), String(value));
    },
    removeItem: (key) => {
      store.delete(String(key));
    },
    clear: () => {
      store.clear();
    },
    key: (index) => Array.from(store.keys())[Number(index)] ?? null,
    get length() {
      return store.size;
    },
  };
};

globalThis.localStorage = createStorageMock();
globalThis.sessionStorage = createStorageMock();

// --- Polyfills necesarios para jsdom ---
if (typeof globalThis.SharedArrayBuffer === "undefined") {
  // jsdom no expone SharedArrayBuffer por defecto y algunas dependencias (whatwg-url) lo requieren al inicializarse.
  class SharedArrayBufferMock extends ArrayBuffer {}
  globalThis.SharedArrayBuffer = SharedArrayBufferMock;
}

// Node 18 (GitHub Actions) no soporta ArrayBuffer resizable/growable y whatwg-url
// asume la presencia de estas props al inicializarse. Declaramos getters no-op
// para evitar TypeError: Cannot read properties of undefined (reading 'get').
const resizableDescriptor = Object.getOwnPropertyDescriptor(
  ArrayBuffer.prototype,
  "resizable"
);
if (!resizableDescriptor) {
  Object.defineProperty(ArrayBuffer.prototype, "resizable", {
    configurable: true,
    enumerable: false,
    get() {
      return false;
    },
  });
}

const growableDescriptor = Object.getOwnPropertyDescriptor(
  SharedArrayBuffer.prototype,
  "growable"
);
if (!growableDescriptor) {
  Object.defineProperty(SharedArrayBuffer.prototype, "growable", {
    configurable: true,
    enumerable: false,
    get() {
      return false;
    },
  });
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = () => ({
    matches: false,
    media: "",
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

if (typeof window !== "undefined" && !("IntersectionObserver" in window)) {
  class IntersectionObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  window.IntersectionObserver = IntersectionObserverMock;
  window.IntersectionObserverEntry = class {};
}

beforeAll(() => {
  ensureLogFile();
  logLine(`SETUP | Peticiones reales habilitadas hacia ${activeBaseUrl}`);
});

beforeEach((context) => {
  const { task } = context ?? {};
  if (isTestTask(task)) {
    const suiteName = task?.suite?.name || task?.suite?.filepath || "root";
    logLine(`INICIO | ${task.name} | Suite: ${suiteName}`);
    taskStartTimes.set(task, Date.now());
  }
});

afterEach((context) => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();

  const { task } = context ?? {};
  if (!isTestTask(task)) return;

  const status = task?.result?.state ?? "desconocido";
  const errorMessage = task?.result?.error
    ? ` | ERROR: ${task.result.error.message}`
    : "";
  const startedAt = taskStartTimes.get(task);
  const durationMs =
    typeof startedAt === "number" ? `${Date.now() - startedAt}ms` : "n/a";
  logLine(
    `FIN | ${task.name} | Resultado: ${status}${errorMessage} | Duracion: ${durationMs}`
  );
  taskStartTimes.delete(task);
});

afterAll(() => {
  logLine("TEARDOWN | Ciclo de pruebas finalizado.");
});
