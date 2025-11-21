import "dotenv/config";
import axios from "axios";
import process from "node:process";
import { beforeAll, describe, expect, it } from "vitest";
import { resolveAuthSession } from "../utils/realBackendSession";

const shouldRunRemote = process.env.RUN_REMOTE_TESTS === "true";
const describeIf = shouldRunRemote ? describe : describe.skip;

const sanitizeUrl = (value) => value?.replace(/\/+$/, "") ?? "";

const fallbackBase =
  "https://servidor-turnosapp-dip-fullstack.onrender.com";

const configuredBase = sanitizeUrl(process.env.VITE_API_BASE_URL || "");
const baseURL = sanitizeUrl(configuredBase || fallbackBase);

const httpClient = axios.create({
  baseURL,
  timeout: 20_000,
  validateStatus: () => true,
});

beforeAll(async () => {
  try {
    const session = await resolveAuthSession({ role: "superadmin" });
    if (session?.token) {
      httpClient.defaults.headers.common.Authorization = `Bearer ${session.token}`;
    }
  } catch (e) {
    // Si falla autenticación, las pruebas reflejarán el estado real con 401
  }
});

describeIf("Disponibilidad real de la API de turnos", () => {
  it(
    "devuelve el listado de turnos publicado",
    async () => {
      const response = await httpClient.get("/turnos");
      expect([200, 304]).toContain(response.status);
      expect(Array.isArray(response.data)).toBe(true);
    },
    25_000
  );

  it(
    "permite crear y eliminar un turno temporal",
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

      const createResponse = await httpClient.post("/turnos", payload);
      if (![200, 201].includes(createResponse.status)) {
        // Log de diagnostico para el backend real
        // eslint-disable-next-line no-console
        console.error("[E2E][serverAvailability] Create turno status:", createResponse.status, createResponse.data);
      }
      expect([200, 201]).toContain(createResponse.status);
      const createdId = createResponse.data?.id;
      expect(createdId).toBeTruthy();

      const deleteResponse = await httpClient.delete(`/turnos/${createdId}`);
      expect([200, 204]).toContain(deleteResponse.status);
    },
    30_000
  );
});
