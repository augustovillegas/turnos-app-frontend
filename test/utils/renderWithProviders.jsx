// === Render Helpers ===
// Utilidades para montar la aplicacion con los providers reales durante las pruebas.

import React from "react";
import { JSDOM } from "jsdom";
import { render } from "@testing-library/react";
import App from "../../src/App";
import { AppProviders } from "../../src/context/AppProviders";
import { authFixtures, fixtures } from "./mocks/fixtures";

const ensureDom = () => {
  if (typeof document !== "undefined" && typeof window !== "undefined") {
    return;
  }

  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: "https://turnos-app.test/",
  });
  globalThis.window = dom.window;
  globalThis.document = dom.window.document;
  if (typeof globalThis.navigator === "undefined") {
    globalThis.navigator = dom.window.navigator;
  }
  if (typeof globalThis.HTMLElement === "undefined") {
    globalThis.HTMLElement = dom.window.HTMLElement;
  }
  if (typeof globalThis.MutationObserver === "undefined") {
    globalThis.MutationObserver = dom.window.MutationObserver;
  }
};

const ensureStorage = (name) => {
  if (typeof globalThis[name] !== "undefined" && globalThis[name] !== null) {
    return;
  }
  const store = new Map();
  globalThis[name] = {
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
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[Number(index)] ?? null,
    get length() {
      return store.size;
    },
  };
};

ensureDom();
ensureStorage("localStorage");
ensureStorage("sessionStorage");
if (typeof globalThis.React === "undefined") {
  globalThis.React = React;
}

const persistJSON = (key, value) => {
  if (value === undefined) return;
  localStorage.setItem(key, JSON.stringify(value));
};

export const primeAppState = ({
  turnos = fixtures.turnos,
  entregas = fixtures.entregas,
  usuarios = fixtures.usuarios,
} = {}) => {
  persistJSON("turnos", turnos);
  persistJSON("entregas", entregas);
  persistJSON("usuarios", usuarios);
};

export const loginAs = (role) => {
  const user =
    typeof role === "object" && role !== null
      ? role
      : authFixtures[role] ?? null;

  if (user) {
    localStorage.setItem("token", "test-token");
    persistJSON("user", user);
  } else {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  return user;
};

export const renderApp = ({ route = "/", user, state } = {}) => {
  if (state) {
    primeAppState(state);
  } else {
    primeAppState();
  }

  if (route && typeof window !== "undefined" && window?.history) {
    window.history.replaceState({}, "Test", route);
  }

  const authUser = user ? loginAs(user) : null;

  const result = render(
    <AppProviders>
      <App />
    </AppProviders>
  );

  return {
    ...result,
    user: authUser,
  };
};
