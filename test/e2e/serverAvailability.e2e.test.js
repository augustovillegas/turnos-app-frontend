import axios from "axios";
import process from "node:process";
import { beforeEach, describe, expect, it } from "vitest";
import { HttpResponse, http } from "msw";
import { server } from "../utils/mocks/server";

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

describeIf("Disponibilidad real de la API de turnos", () => {
  beforeEach(() => {
    server.use(
      http.all(`${baseURL}/:path*`, () => HttpResponse.passthrough())
    );
  });

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
      const payload = {
        review: 9,
        fecha: "2025-03-01",
        horario: "09:00 - 10:00",
        sala: `Turno remoto ${now}`,
        zoomLink: `https://example.com/remote-${now}`,
        estado: "Disponible",
        start: "2025-03-01T12:00:00.000Z",
        end: "2025-03-01T13:00:00.000Z",
        comentarios: "Generado por tests e2e",
      };

      const createResponse = await httpClient.post("/turnos", payload);
      expect([200, 201]).toContain(createResponse.status);
      const createdId = createResponse.data?.id;
      expect(createdId).toBeTruthy();

      const deleteResponse = await httpClient.delete(`/turnos/${createdId}`);
      expect([200, 204]).toContain(deleteResponse.status);
    },
    30_000
  );
});
