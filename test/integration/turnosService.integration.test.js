import { afterEach, describe, expect, it } from "vitest";
import {
  createTurno,
  deleteTurno,
  getTurnoById,
  getTurnos,
  updateTurno,
} from "../../src/services/turnosService";
import { buildTurnoPayloadFromForm } from "../../src/utils/turnos/form";

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
    sala: `Sala Test ${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
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

describe.sequential("Servicios de turnos (API real)", () => {
  const TEST_TIMEOUT = 20_000;

  it(
    "crea un turno y lo puede recuperar",
    async () => {
      const formValues = buildFormValues();
      const payload = buildTurnoPayloadFromForm(formValues);

      expect(payload).toMatchObject({
        review: Number(formValues.review),
        sala: formValues.sala,
        estado: "Disponible",
      });

      const created = await createTurno(payload);
      registerCreated(created);

      expect(created).toMatchObject({
        sala: payload.sala,
        estado: payload.estado,
      });
      expect(typeof created.id).toBe("string");
      expect(created.id.length).toBeGreaterThanOrEqual(10);

      const fetched = await getTurnoById(created.id);
      expect(fetched.id).toBe(created.id);
      expect(fetched.sala).toBe(payload.sala);
      expect(fetched.review).toBe(payload.review);
    },
    TEST_TIMEOUT
  );

  it(
    "actualiza un turno recien creado",
    async () => {
      const payload = buildTurnoPayloadFromForm(buildFormValues());
      const created = await createTurno(payload);
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
      const turno = await createTurno(payload);
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
    "rechaza la creacion con datos invalidos",
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
      const turno = await createTurno(payload);
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
