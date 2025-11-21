// === Utilidades de Render ===
// Monta la app real con providers y un router de memoria para escenarios de prueba.

import React from "react";
import { JSDOM } from "jsdom";
import { render } from "@testing-library/react";
import App from "../../src/App";
import { AppProviders } from "../../src/context/AppProviders";
import {
  RUTAS_APLICACION,
  createRouterMemoria,
} from "../../src/router/createAppRouter";
import {
  resolveAuthSession,
  clearStoredSession,
} from "./realBackendSession";

const asegurarDom = () => {
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

const asegurarStorage = (nombre) => {
  if (typeof globalThis[nombre] !== "undefined" && globalThis[nombre] !== null) {
    return;
  }
  const almacen = new Map();
  globalThis[nombre] = {
    getItem: (llave) => {
      const valor = almacen.get(String(llave));
      return valor === undefined ? null : valor;
    },
    setItem: (llave, valor) => {
      almacen.set(String(llave), String(valor));
    },
    removeItem: (llave) => {
      almacen.delete(String(llave));
    },
    clear: () => almacen.clear(),
    key: (indice) => Array.from(almacen.keys())[Number(indice)] ?? null,
    get length() {
      return almacen.size;
    },
  };
};

asegurarDom();
asegurarStorage("localStorage");
asegurarStorage("sessionStorage");
if (typeof globalThis.React === "undefined") {
  globalThis.React = React;
}

const resetPersistentState = () => {
  clearStoredSession();
  if (typeof sessionStorage !== "undefined" && sessionStorage !== null) {
    sessionStorage.clear();
  }
};

const resolveAuthConfig = (options = {}) => {
  if (options.auth) return options.auth;
  if (options.user) {
    return typeof options.user === "string"
      ? { role: options.user }
      : options.user;
  }
  return null;
};

export const renderApp = async ({ route = "/", user, auth } = {}) => {
  resetPersistentState();

  const authConfig = resolveAuthConfig({ user, auth });
  const session = await resolveAuthSession(authConfig, { persist: true });

  if (route && typeof window !== "undefined" && window?.history) {
    window.history.replaceState({}, "Test", route);
  }

  const rutasResueltas = await resolverRutas(RUTAS_APLICACION);
  const routerDeMemoria = createRouterMemoria({
    entradasIniciales: [route],
    rutasPersonalizadas: rutasResueltas,
  });

  const resultado = render(
    <AppProviders>
      <App router={routerDeMemoria} />
    </AppProviders>
  );
  if (typeof routerDeMemoria.initialize === "function") {
    await routerDeMemoria.initialize();
  }

  return {
    ...resultado,
    user: session?.user ?? null,
    token: session?.token ?? null,
    router: routerDeMemoria,
  };
};
const resolverRutas = async (rutas = []) =>
  Promise.all(
    rutas.map(async (ruta) => {
      const hijos = ruta.children ? await resolverRutas(ruta.children) : undefined;
      if (typeof ruta.lazy !== "function") {
        return {
          ...ruta,
          children: hijos,
        };
      }
      const modulo = await ruta.lazy();
      const {
        Component,
        ErrorBoundary,
        loader,
        action,
        shouldRevalidate,
        handle,
        headers,
      } = modulo ?? {};

      return {
        ...ruta,
        lazy: undefined,
        children: hijos,
        Component: Component ?? modulo?.default ?? ruta.Component,
        ErrorBoundary: ErrorBoundary ?? ruta.ErrorBoundary,
        loader: loader ?? ruta.loader,
        action: action ?? ruta.action,
        shouldRevalidate: shouldRevalidate ?? ruta.shouldRevalidate,
        handle: handle ?? ruta.handle,
        headers: headers ?? ruta.headers,
      };
    })
  );
