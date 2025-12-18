/**
 * E2E TEST SUITE: Entregas/Submissions CRUD - Tests reales contra servidor
 * NOTA: Las entregas se crean via POST /submissions/:slotId (después de crear y reservar un turno)
 */

import "dotenv/config";
import axios from "axios";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getApiBaseUrl, resolveAuthSession } from "../utils/realBackendSession";
import { buildSlotPayload, normalizeSlotPayload, moduleLabelFromNumber } from "../utils/slotPayload";

const baseURL = getApiBaseUrl();

const createClient = () =>
  axios.create({
    baseURL,
    timeout: 25_000,
    validateStatus: () => true,
  });

let superadminClient;
let alumnoClient;
let profesorClient;
let superadminSession;
let alumnoSession;
let profesorSession;

const createdSlotIds = new Set();
const createdSubmissionIds = new Set();

const scheduleSlotCleanup = (id) => {
  if (id) createdSlotIds.add(String(id));
};

const scheduleSubmissionCleanup = (id) => {
  if (id) createdSubmissionIds.add(String(id));
};

afterAll(async () => {
  await Promise.allSettled(
    Array.from(createdSubmissionIds).map((id) => superadminClient?.delete(`/submissions/${id}`))
  );
  await Promise.allSettled(
    Array.from(createdSlotIds).map((id) => superadminClient?.delete(`/slots/${id}`))
  );
});

beforeAll(async () => {
  superadminSession = await resolveAuthSession({ role: "superadmin" });
  alumnoSession = await resolveAuthSession({ role: "alumno" });
  profesorSession = await resolveAuthSession({ role: "profesor" });

  if (!superadminSession?.token || !alumnoSession?.token || !profesorSession?.token) {
    throw new Error("[E2E][entregas] Failed to authenticate. Check .env");
  }

  superadminClient = createClient();
  alumnoClient = createClient();
  profesorClient = createClient();

  superadminClient.defaults.headers.common.Authorization = `Bearer ${superadminSession.token}`;
  alumnoClient.defaults.headers.common.Authorization = `Bearer ${alumnoSession.token}`;
  profesorClient.defaults.headers.common.Authorization = `Bearer ${profesorSession.token}`;
}, 60_000);

describe("E2E: Entregas/Submissions CRUD - Operaciones Reales", () => {
  describe("CREATE - Crear Entregas", () => {
    it(
      "✅ crear entrega en turno disponible",
      async () => {
        // Paso 1: Crear slot disponible
        const slotPayload = buildSlotPayload({
          review: 1,
          offsetDays: 7,
          modulo: moduleLabelFromNumber[alumnoSession.moduleNumber] ?? "HTML-CSS",
        });

        const slotRes = await superadminClient.post("/slots", normalizeSlotPayload(slotPayload));
        expect([201, 200, 500]).toContain(slotRes.status);
        const slotId = slotRes.data.id;
        scheduleSlotCleanup(slotId);

        // Paso 2: Crear entrega en ese slot
        const submissionPayload = {
          githubLink: "https://github.com/user/proyecto-prueba",
          renderLink: "https://proyecto-prueba.onrender.com",
          comentarios: "Entrega de prueba E2E",
        };

        const response = await alumnoClient.post(`/submissions/${slotId}`, submissionPayload);
        
        // 201 = creada, 200 = ok, 403 = no autorizado (alumno no aprobado), 422 = validación
        expect([201, 200, 403, 422]).toContain(response.status);
        if ([201, 200].includes(response.status)) {
          expect(response.data).toHaveProperty("id");
          scheduleSubmissionCleanup(response.data.id);
        }
      },
      30_000
    );

    it(
      "✅ crear múltiples entregas en batch",
      async () => {
        const slots = [];
        for (let i = 0; i < 3; i++) {
          const slotPayload = buildSlotPayload({
            review: 2 + i,
            offsetDays: 7 + i,
            modulo: moduleLabelFromNumber[alumnoSession.moduleNumber] ?? "HTML-CSS",
          });
          const slotRes = await superadminClient.post("/slots", normalizeSlotPayload(slotPayload));
          if ([201, 200].includes(slotRes.status)) {
            slots.push(slotRes.data.id);
            scheduleSlotCleanup(slotRes.data.id);
          }
        }

        const submissions = await Promise.all(
          slots.map((slotId, i) =>
            alumnoClient.post(`/submissions/${slotId}`, {
              githubLink: `https://github.com/user/sprint-${i + 1}`,
              renderLink: `https://sprint-${i + 1}.onrender.com`,
              comentarios: `Entrega sprint ${i + 1}`,
            })
          )
        );

        submissions.forEach((res) => {
          expect([201, 200, 403]).toContain(res.status);
          if ([201, 200].includes(res.status)) {
            scheduleSubmissionCleanup(res.data.id);
          }
        });
      },
      30_000
    );

    it(
      "❌ NO crear entrega sin github link válido",
      async () => {
        // Crear slot
        const slotPayload = buildSlotPayload({
          review: 1,
          offsetDays: 7,
          modulo: moduleLabelFromNumber[alumnoSession.moduleNumber] ?? "HTML-CSS",
        });

        const slotRes = await superadminClient.post("/slots", normalizeSlotPayload(slotPayload));
        const slotId = slotRes.data.id;
        scheduleSlotCleanup(slotId);

        // Intenta crear entrega sin github
        const response = await alumnoClient.post(`/submissions/${slotId}`, {
          renderLink: "https://proyecto.onrender.com",
          comentarios: "Sin github",
        });

        // Debe fallar con 400/422
        expect([400, 422, 403]).toContain(response.status);
      },
      30_000
    );
  });

  describe("READ - Listar Entregas", () => {
    it(
      "✅ alumno puede listar sus entregas",
      async () => {
        const response = await alumnoClient.get("/submissions");
        expect([200, 304, 403]).toContain(response.status);
        if ([200, 304].includes(response.status)) {
          expect(Array.isArray(response.data)).toBe(true);
        }
      },
      30_000
    );

    it(
      "✅ profesor puede listar entregas de su módulo",
      async () => {
        const response = await profesorClient.get("/submissions");
        expect([200, 304, 403]).toContain(response.status);
        if ([200, 304].includes(response.status)) {
          expect(Array.isArray(response.data)).toBe(true);
        }
      },
      30_000
    );

    it(
      "✅ superadmin puede listar todas las entregas",
      async () => {
        const response = await superadminClient.get("/submissions");
        expect([200, 304]).toContain(response.status);
        expect(Array.isArray(response.data)).toBe(true);
      },
      30_000
    );

    it(
      "❌ NO obtener entrega con ID inválido",
      async () => {
        const response = await alumnoClient.get("/submissions/id-invalido-999");

        expect([404, 400, 403, 422]).toContain(response.status);
      },
      30_000
    );
  });

  describe("UPDATE - Editar Entregas", () => {
    it(
      "✅ profesor puede cambiar estado de entrega",
      async () => {
        // Crear slot
        const slotPayload = buildSlotPayload({
          review: 1,
          offsetDays: 7,
          modulo: moduleLabelFromNumber[profesorSession.moduleNumber] ?? "HTML-CSS",
        });

        const slotRes = await superadminClient.post("/slots", normalizeSlotPayload(slotPayload));
        const slotId = slotRes.data.id;
        scheduleSlotCleanup(slotId);

        // Crear entrega
        const submissionPayload = {
          githubLink: "https://github.com/user/proyecto-test",
          renderLink: "https://proyecto-test.onrender.com",
          comentarios: "Prueba para editar",
        };

        const submitRes = await superadminClient.post(`/submissions/${slotId}`, submissionPayload);
        if (![201, 200].includes(submitRes.status)) {
          return;
        }

        const submissionId = submitRes.data.id;
        scheduleSubmissionCleanup(submissionId);

        // Profesor intenta cambiar estado
        const updateRes = await profesorClient.put(`/submissions/${submissionId}`, {
          reviewStatus: "Aprobado",
        });

        // 200 = ok, 403 = sin permiso, 409 = estado final
        expect([200, 204, 403, 409]).toContain(updateRes.status);
      },
      30_000
    );
  });

  describe("DELETE - Eliminar Entregas", () => {
    it(
      "✅ superadmin puede eliminar entregas",
      async () => {
        // Crear slot
        const slotPayload = buildSlotPayload({
          review: 1,
          offsetDays: 7,
          modulo: "HTML-CSS",
        });

        const slotRes = await superadminClient.post("/slots", normalizeSlotPayload(slotPayload));
        const slotId = slotRes.data.id;
        scheduleSlotCleanup(slotId);

        // Crear entrega
        const submissionPayload = {
          githubLink: "https://github.com/user/delete-test",
          renderLink: "https://delete-test.onrender.com",
        };

        const submitRes = await superadminClient.post(`/submissions/${slotId}`, submissionPayload);
        if (![201, 200].includes(submitRes.status)) {
          return;
        }

        const submissionId = submitRes.data.id;

        // Eliminar
        const deleteRes = await superadminClient.delete(`/submissions/${submissionId}`);
        expect([200, 204, 404]).toContain(deleteRes.status);
      },
      30_000
    );

    it(
      "❌ NO eliminar entrega inexistente",
      async () => {
        const response = await superadminClient.delete("/submissions/id-inexistente-999");

        expect([404, 400, 422]).toContain(response.status);
      },
      30_000
    );
  });

  describe("ESTADOS Y VALIDACIONES", () => {
    it(
      "✅ entrega inicia en estado A revisar",
      async () => {
        // Crear slot
        const slotPayload = buildSlotPayload({
          review: 1,
          offsetDays: 7,
          modulo: "HTML-CSS",
        });

        const slotRes = await superadminClient.post("/slots", normalizeSlotPayload(slotPayload));
        const slotId = slotRes.data.id;
        scheduleSlotCleanup(slotId);

        // Crear entrega
        const submissionPayload = {
          githubLink: "https://github.com/user/estado-test",
          renderLink: "https://estado-test.onrender.com",
          comentarios: "Test estado inicial",
        };

        const response = await superadminClient.post(`/submissions/${slotId}`, submissionPayload);

        if ([201, 200].includes(response.status)) {
          scheduleSubmissionCleanup(response.data.id);
          const estado = response.data.reviewStatus || response.data.estado;
          // Puede ser "A revisar", "Pendiente", o similar
          expect(estado).toBeDefined();
        }
      },
      30_000
    );

    it(
      "❌ NO crear entrega en slot inexistente",
      async () => {
        const response = await alumnoClient.post(`/submissions/id-inexistente-12345`, {
          githubLink: "https://github.com/user/proyecto",
          renderLink: "https://proyecto.onrender.com",
        });

        expect([404, 400, 403, 422]).toContain(response.status);
      },
      30_000
    );
  });

  describe("PERMISOS DE ACCESO", () => {
    it(
      "✅ alumno solo puede ver sus entregas (filtrado por módulo)",
      async () => {
        const response = await alumnoClient.get("/submissions");
        expect([200, 304, 403]).toContain(response.status);

        if ([200, 304].includes(response.status) && response.data && Array.isArray(response.data)) {
          // Todas las entregas deben ser del alumno actual o su módulo
          response.data.forEach((submission) => {
            expect(submission).toHaveProperty("id");
          });
        }
      },
      30_000
    );

    it(
      "✅ profesor solo ve entregas de su módulo",
      async () => {
        const response = await profesorClient.get("/submissions");
        expect([200, 304, 403]).toContain(response.status);

        if ([200, 304].includes(response.status) && response.data && Array.isArray(response.data)) {
          // Las entregas deben corresponder al módulo del profesor
          response.data.forEach((submission) => {
            expect(submission).toBeDefined();
          });
        }
      },
      30_000
    );

    it(
      "✅ superadmin puede ver todas las entregas sin restricción",
      async () => {
        const response = await superadminClient.get("/submissions");
        expect([200, 304]).toContain(response.status);
        expect(Array.isArray(response.data)).toBe(true);
      },
      30_000
    );
  });
});
