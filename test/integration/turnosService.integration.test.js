import "dotenv/config";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createTurno,
  deleteTurno,
  getTurnoById,
  getTurnos,
  updateTurno,
} from "../../src/services/turnosService";
import { buildTurnoPayloadFromForm } from "../../src/utils/turnos/form";
import { resolveAuthSession } from "../utils/realBackendSession";

const MS_PER_MINUTE = 60_000;

const futureDate = (minutesAhead = 60) => {
  const date = new Date(Date.now() + minutesAhead * MS_PER_MINUTE);
  const isoDate = date.toISOString();
  return {
    date: isoDate.slice(0, 10),
    startTime: isoDate.slice(11, 16),
    endTime: new Date(date.getTime() + 30 * MS_PER_MINUTE)
      .toISOString()
      .slice(11, 16),
  };
};

const buildFormValues = (overrides = {}) => {
  const { date, startTime, endTime } = futureDate();
  return {
    review: "5",
    fecha: date,
    horaInicio: startTime,
    horaFin: endTime,
    // Sala numeric (room) requerido por backend
    sala: String(Math.floor(Date.now() / 60000)),
    zoomLink: "https://example.com/test",
    comentarios: "Generado automaticamente por tests",
    estado: "Disponible",
    ...overrides,
  };
};

const createdTurnos = new Set();

const registerCreated = (turno) => {
  if (turno?.id) {
    createdTurnos.add(String(turno.id));
  }
};

const cleanupTurnos = async () => {
  if (!createdTurnos.size) return;
  const ids = Array.from(createdTurnos);
  createdTurnos.clear();
  await Promise.allSettled(
    ids.map((id) =>
      deleteTurno(id).catch(() => {
        // Ignorar errores de limpieza para no interferir con los asserts reales
      })
    )
  );
};

afterEach(async () => {
  await cleanupTurnos();
});

// Autenticación real antes de cada test para habilitar endpoints protegidos
beforeEach(async () => {
  await resolveAuthSession({ role: "superadmin" }, { persist: true });
});

describe.sequential("Servicios de turnos (API real)", () => {
  const TEST_TIMEOUT = 20_000;

  it(
    "crea un turno y lo puede recuperar",
    async () => {
      const formValues = buildFormValues();
      const payload = buildTurnoPayloadFromForm(formValues);

      expect(payload).toMatchObject({
        review: Number(formValues.review),
        sala: Number(formValues.sala),
        estado: "Disponible",
      });

      let created;
      try {
        created = await createTurno(payload);
      } catch (e) {
        const status = e?.response?.status;
        const data = e?.response?.data;
        console.error("[TEST][turnos] Error al crear turno:", status, data);
        throw e;
      }
      registerCreated(created);

      expect(created).toMatchObject({
        sala: Number(payload.sala),
        estado: payload.estado,
      });
      expect(typeof created.id).toBe("string");
      expect(created.id.length).toBeGreaterThanOrEqual(10);

      const fetched = await getTurnoById(created.id);
      expect(fetched.id).toBe(created.id);
      expect(fetched.sala).toBe(payload.sala);
      expect(fetched.review).toBe(payload.review);
    },
    30_000
  );

  it(
    "actualiza un turno recien creado",
    async () => {
      const payload = buildTurnoPayloadFromForm(buildFormValues());
      let created;
      try {
        created = await createTurno(payload);
      } catch (e) {
        console.error("[TEST][turnos] Error al crear para update:", e?.response?.status, e?.response?.data);
        throw e;
      }
      registerCreated(created);

      const comentarios = "Actualizado por test";
      const estado = "Solicitado";

      const updated = await updateTurno(created.id, {
        ...created,
        estado,
        comentarios,
      });

      expect(updated.estado).toBe(estado);
      expect(updated.comentarios).toContain(comentarios);

      const reloaded = await getTurnoById(created.id);
      expect(reloaded.estado).toBe(estado);
      expect(reloaded.comentarios).toContain(comentarios);
    },
    TEST_TIMEOUT
  );

  it(
    "elimina un turno y la busqueda posterior falla",
    async () => {
      const payload = buildTurnoPayloadFromForm(buildFormValues());
      let turno;
      try {
        turno = await createTurno(payload);
      } catch (e) {
        console.error("[TEST][turnos] Error al crear para delete:", e?.response?.status, e?.response?.data);
        throw e;
      }
      registerCreated(turno);

      const response = await deleteTurno(turno.id);

      // Algunos despliegues devuelven cuerpo vacio, otros { success: true }
      if (response && typeof response === "object") {
        expect(response).toMatchObject({ success: true });
      } else {
        expect([null, undefined, ""]).toContain(response);
      }

      // Evita intentar borrarlo nuevamente en el cleanup
      createdTurnos.delete(String(turno.id));

      await expect(getTurnoById(turno.id)).rejects.toMatchObject({
        response: { status: 404 },
      });
    },
    TEST_TIMEOUT
  );

  it(
    "rechaza la creación con datos inválidos",
    async () => {
      await expect(
        createTurno({
          review: 0,
          fecha: "",
          horario: "",
          sala: "",
          zoomLink: "",
          estado: "",
          start: "",
          end: "",
          comentarios: "",
        })
      ).rejects.toMatchObject({
        response: { status: expect.any(Number) },
      });
    },
    TEST_TIMEOUT
  );

  it(
    "devuelve listado de turnos incluyendo los nuevos",
    async () => {
      const payload = buildTurnoPayloadFromForm(buildFormValues());
      let turno;
      try {
        turno = await createTurno(payload);
      } catch (e) {
        console.error("[TEST][turnos] Error al crear para listado:", e?.response?.status, e?.response?.data);
        throw e;
      }
      registerCreated(turno);

      const turnos = await getTurnos();
      expect(Array.isArray(turnos)).toBe(true);
      expect(turnos.length).toBeGreaterThan(0);
      expect(
        turnos.some((item) => String(item.id) === String(turno.id))
      ).toBe(true);
    },
    TEST_TIMEOUT
  );
});
