import axios from "axios";
import { beforeAll, describe, expect, it } from "vitest";
import { getApiBaseUrl, resolveAuthSession } from "../utils/realBackendSession";

// Ejecutar siempre contra servidor real (sin gating por RUN_REMOTE_TESTS)

const sanitizeUrl = (value) => value?.replace(/\/+$/, "") ?? "";
const baseURL = sanitizeUrl(getApiBaseUrl());

const httpClient = axios.create({
  baseURL,
  timeout: 20_000,
  validateStatus: () => true,
});

beforeAll(async () => {
  const session = await resolveAuthSession({ role: "superadmin" });
  if (!session?.token) {
    throw new Error("[E2E][serverAvailability] Failed to authenticate as superadmin");
  }
  httpClient.defaults.headers.common.Authorization = `Bearer ${session.token}`;
});

describe("Disponibilidad real de la API de turnos", () => {
  it(
    "devuelve el listado de slots publicado",
    async () => {
      const response = await httpClient.get("/slots");
      expect([200, 304]).toContain(response.status);
      expect(Array.isArray(response.data)).toBe(true);
    },
    25_000
  );

  it(
    "permite crear y eliminar un slot temporal",
    async () => {
      const now = Date.now();
      const startIso = "2025-03-01T12:00:00.000Z";
      const endIso = "2025-03-01T13:00:00.000Z";
      const toHM = (iso) => new Date(iso).toISOString().slice(11, 16);
      const durationMinutes = Math.max(
        0,
        Math.round((new Date(endIso) - new Date(startIso)) / 60000)
      );
      const roomNumber = Math.floor(now / 60000);
      const payload = {
        review: 9,
        reviewNumber: 9,
        fecha: "2025-03-01",
        date: "2025-03-01",
        horario: "12:00 - 13:00",
        sala: String(roomNumber), // numeric expected
        room: roomNumber,
        zoomLink: `https://example.com/remote-${now}`,
        estado: "Disponible",
        start: startIso,
        end: endIso,
        startTime: toHM(startIso),
        endTime: toHM(endIso),
        duracion: durationMinutes,
        comentarios: "Generado por tests e2e",
      };

      const createResponse = await httpClient.post("/slots", payload);
      if (![200, 201].includes(createResponse.status)) {
        // Log de diagnostico para el backend real
        console.error("[E2E][serverAvailability] Create slot status:", createResponse.status, createResponse.data);
      }
      expect([200, 201]).toContain(createResponse.status);
      const createdId = createResponse.data?.id;
      expect(createdId).toBeTruthy();

      const deleteResponse = await httpClient.delete(`/slots/${createdId}`);
      expect([200, 204]).toContain(deleteResponse.status);
    },
    30_000
  );

  it(
    "valida contrato de error unificado {message, errores?}",
    async () => {
      // Forzar error 400 con payload inválido
      const invalidPayload = {
        sala: -1, // inválido: debe ser > 0
        horario: "invalid",
      };

      const response = await httpClient.post("/slots", invalidPayload);
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.status).toBeLessThan(500);
      
      // Validar contrato de error unificado
      expect(response.data).toHaveProperty("message");
      expect(typeof response.data.message).toBe("string");
      
      // No debe contener campos legacy
      expect(response.data).not.toHaveProperty("msg");
      expect(response.data).not.toHaveProperty("code");
      
      // Si hay errores de validación, debe ser un array
      if (response.data.errores) {
        expect(Array.isArray(response.data.errores)).toBe(true);
        if (response.data.errores.length > 0) {
          // Tolerar despliegues que aún no incluyen 'campo'
          expect(response.data.errores[0]).toHaveProperty("mensaje");
        }
      }
    },
    25_000
  );
});
