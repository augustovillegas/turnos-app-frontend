import "dotenv/config";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createUsuario,
  deleteUsuario,
  getUsuarios,
} from "../../src/services/usuariosService";
import { resolveAuthSession } from "../utils/realBackendSession";

const createdUserIds = new Set();

const registerCreated = (user) => {
  const id = user?.id || user?._id;
  if (id) {
    createdUserIds.add(String(id));
  }
  return id;
};

const cleanupUsuarios = async () => {
  if (!createdUserIds.size) return;
  const ids = Array.from(createdUserIds);
  createdUserIds.clear();
  await Promise.allSettled(
    ids.map((id) =>
      deleteUsuario(id).catch(() => {
        // Ignorar errores de limpieza para no romper el resto del suite
      })
    )
  );
};

afterEach(async () => {
  await cleanupUsuarios();
});

// Autenticación real antes de cada test para habilitar endpoints protegidos
beforeEach(async () => {
  await resolveAuthSession({ role: "superadmin" }, { persist: true });
});

const buildEmail = () =>
  `auto.test.${Date.now()}-${Math.random().toString(16).slice(2, 6)}@example.com`;

describe.sequential("Usuarios - Integración real contra API", () => {
  const TEST_TIMEOUT = 25_000;

  it(
    "crea un usuario, verifica el listado actualizado y lo elimina",
    async () => {
      const initialList = await getUsuarios();
      console.log(
        "[TEST][usuarios] Total inicial de usuarios:",
        initialList.length
      );

      const email = buildEmail();
      const payload = {
        nombre: "Integration Tester",
        email,
        tipo: "alumno",
        rol: "alumno",
        cohorte: 1,
        modulo: "FRONTEND - REACT",
        password: "Alumno-fullstack-2025",
      };

      console.log("[TEST][usuarios] Payload enviado:", payload);

      let created;
      try {
        created = await createUsuario(payload);
      } catch (e) {
        console.error(
          "[TEST][usuarios] Error al crear usuario:",
          e?.response?.status,
          e?.response?.data
        );
        throw e;
      }
      console.log("[TEST][usuarios] Respuesta al crear:", created);

      const createdId = registerCreated(created);
      expect(createdId).toBeTruthy();
      expect(
        String(created.email || "").toLowerCase()
      ).toContain(email.toLowerCase());

      const updatedList = await getUsuarios();
      console.log(
        "[TEST][usuarios] Total luego de crear:",
        updatedList.length
      );
      expect(updatedList.length).toBe(initialList.length + 1);
      expect(
        updatedList.some(
          (user) => String(user.email || "").toLowerCase() === email.toLowerCase()
        )
      ).toBe(true);

      if (createdId) {
        console.log("[TEST][usuarios] Eliminando usuario:", createdId);
        await deleteUsuario(createdId);
        createdUserIds.delete(String(createdId));
      }

      const finalList = await getUsuarios();
      console.log(
        "[TEST][usuarios] Total luego de cleanup:",
        finalList.length
      );
      expect(finalList.length).toBe(initialList.length);
      expect(
        finalList.some(
          (user) => String(user.email || "").toLowerCase() === email.toLowerCase()
        )
      ).toBe(false);
    },
    TEST_TIMEOUT
  );
});
