/* eslint-env node */
/* global process */
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { appendFileSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterAll, afterEach, beforeAll, beforeEach } from "vitest";
import { resetMockState, server } from "./utils/mocks/server";

const LOG_DIR = resolve(process.cwd(), "test", "logs");
const LOG_FILE = resolve(LOG_DIR, "test-run.log");

let isLogInitialised = false;

const ensureLogFile = () => {
  if (isLogInitialised) return;
  mkdirSync(LOG_DIR, { recursive: true });
  writeFileSync(
    LOG_FILE,
    `\n=== Nueva ejecucion de pruebas: ${new Date().toISOString()} ===\n`,
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

// --- Polyfills necesarios para jsdom ---
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
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach((context) => {
  const { task } = context ?? {};
  if (isTestTask(task)) {
    logLine(`INICIO | ${task.name}`);
  }
});

afterEach((context) => {
  cleanup();
  server.resetHandlers();
  resetMockState();
  localStorage.clear();
  sessionStorage.clear();

  const { task } = context ?? {};
  if (!isTestTask(task)) return;

  const status = task?.result?.state ?? "desconocido";
  const errorMessage = task?.result?.error
    ? ` | ERROR: ${task.result.error.message}`
    : "";
  logLine(`FIN | ${task.name} | Resultado: ${status}${errorMessage}`);
});

afterAll(() => {
  server.close();
});
