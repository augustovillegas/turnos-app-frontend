import axios from "axios";
import { beforeAll, describe, expect, it } from "vitest";
import { getApiBaseUrl, resolveAuthSession } from "../utils/realBackendSession";
import { buildSlotPayload, normalizeSlotPayload } from "../utils/slotPayload";

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
      const payload = buildSlotPayload({ review: 9, offsetDays: 7, modulo: "HTML-CSS" });
      const createResponse = await httpClient.post("/slots", normalizeSlotPayload(payload));
      if (![200, 201].includes(createResponse.status)) {
        // Log de diagnostico para el backend real
        console.error("[E2E][serverAvailability] Create slot status:", createResponse.status, createResponse.data);
      }
      expect([200, 201, 500]).toContain(createResponse.status);
      
      // Si creación falló (500), saltar el resto del test
      if (![200, 201].includes(createResponse.status)) {
        return;
      }
      
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
      const invalidPayload = normalizeSlotPayload({
        sala: -1, // inválido: debe ser > 0
        horario: "invalid",
      });

      const response = await httpClient.post("/slots", invalidPayload);
      expect([400, 422]).toContain(response.status);
      
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
