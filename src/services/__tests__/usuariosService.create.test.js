import { describe, it, expect } from "vitest";
import { createUsuario, deleteUsuario, getUsuarios } from "../usuariosService";
import { apiClient, setApiBaseUrl } from "../apiClient";
import { ensureModuleLabel } from "../../utils/moduleMap";

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

describe("createUsuario integración real", () => {
  it("crea usuario con módulo y cohorte correctos en el servidor", async () => {
    const token = await loginAsSuperadmin();
    expect(token).toBeTruthy();

    const uniqueEmail = `test.integration+${Date.now()}@local.dev`;
    const moduloLabel = "FRONTEND - REACT";
    const cohorte = 2;

    const creado = await createUsuario({
      nombre: "Nuevo",
      email: uniqueEmail,
      password: "Alumno-fullstack-2025",
      modulo: moduloLabel,
      cohorte,
      rol: "alumno",
    });

    const userId = creado?.id ?? creado?._id;
    expect(userId).toBeTruthy();

    // Recuperar desde el servidor para verificar persistencia del módulo
    const lista = await getUsuarios({}, { preferAuth: true });
    const encontrado = Array.isArray(lista)
      ? lista.find((u) => String(u.email).toLowerCase() === uniqueEmail.toLowerCase())
      : null;

    expect(encontrado).toBeTruthy();
    const moduloEncontrado = ensureModuleLabel(encontrado?.modulo);
    expect(moduloEncontrado).toBe(moduloLabel);
    expect(String(encontrado?.cohorte)).toBe(String(cohorte));

    // Limpieza: eliminar usuario creado
    if (userId) {
      await apiClient.delete(`/usuarios/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  });
});
