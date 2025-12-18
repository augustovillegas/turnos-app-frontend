import { describe, it, expect } from "vitest";
import { getUsuarios } from "../usuariosService";
import { apiClient, setApiBaseUrl } from "../apiClient";

const BASE_URL = "http://localhost:3000";
const SUPERADMIN = {
  email: "superadmin.diplomatura@gmail.com",
  password: "Superadmin#2025",
};

const loginAsSuperadmin = async () => {
  setApiBaseUrl(BASE_URL);
  const res = await apiClient.post("/auth/login", {
    email: SUPERADMIN.email,
    password: SUPERADMIN.password,
  });
  const token = res?.data?.token;
  if (!token) throw new Error("No se obtuvo token de login");
  if (globalThis.localStorage) {
    globalThis.localStorage.setItem("token", token);
  }
  return token;
};

describe("getUsuarios integración real", () => {
  it("retorna usuarios con módulo/cohorte presentes desde el servidor", async () => {
    const token = await loginAsSuperadmin();
    expect(token).toBeTruthy();

    const lista = await getUsuarios({}, { preferAuth: true });
    expect(Array.isArray(lista)).toBe(true);
    const algunoConModulo = lista.some((u) => u.modulo);
    const algunoConCohorte = lista.some((u) => u.cohorte != null);

    expect(algunoConModulo).toBe(true);
    expect(algunoConCohorte).toBe(true);
  });
});
