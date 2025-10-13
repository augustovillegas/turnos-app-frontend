// === Render Helpers ===
// Utilidades para montar la aplicacion con los providers reales durante las pruebas.

import { render } from "@testing-library/react";
import App from "../../src/App";
import { AppProviders } from "../../src/context/AppProviders";
import { authFixtures, fixtures } from "./mocks/fixtures";

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

  if (route) {
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
