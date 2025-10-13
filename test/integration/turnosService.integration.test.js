import { describe, expect, it } from "vitest";
import {
  createTurno,
  deleteTurno,
  getTurnoById,
  getTurnos,
  updateTurno,
} from "../../src/services/turnosService";
import { buildTurnoPayloadFromForm } from "../../src/utils/turnos/form";
import { fixtures } from "../utils/mocks/fixtures";

const sampleFormValues = {
  review: "4",
  fecha: "2025-01-20",
  horaInicio: "08:00",
  horaFin: "09:00",
  sala: "Sala Integracion",
  zoomLink: "https://example.com/integration",
  comentarios: "Prueba automática",
  estado: "Disponible",
};

describe("Servicios de turnos (integración MSW)", () => {
  it("obtiene el listado completo de turnos", async () => {
    const turnos = await getTurnos();
    expect(Array.isArray(turnos)).toBe(true);
    expect(turnos).toHaveLength(fixtures.turnos.length);
    expect(turnos[0]).toMatchObject({
      id: "turno-1",
      sala: "Sala A",
    });
  });

  it("normaliza payloads creados desde formularios", async () => {
    const payload = buildTurnoPayloadFromForm(sampleFormValues);
    expect(payload).toMatchObject({
      review: 4,
      fecha: "2025-01-20",
      horario: "08:00 - 09:00",
      sala: "Sala Integracion",
      estado: "Disponible",
    });

    const created = await createTurno(payload);
    expect(created.id).toMatch(/^turno-/);
    expect(created.review).toBe(4);
    expect(created.sala).toBe("Sala Integracion");
  });

  it("actualiza un turno existente y refleja los cambios", async () => {
    const target = fixtures.turnos[0];
    const updated = await updateTurno(target.id, {
      ...target,
      estado: "Aprobado",
      comentarios: "Actualizado en integracion",
    });

    expect(updated.estado).toBe("Aprobado");
    expect(updated.comentarios).toContain("integracion");

    const fetched = await getTurnoById(target.id);
    expect(fetched.estado).toBe("Aprobado");
  });

  it("elimina un turno y confirma la respuesta del backend", async () => {
    const created = await createTurno({
      review: 5,
      fecha: "2025-02-01",
      horario: "10:00 - 11:00",
      sala: "Sala Temporal",
      zoomLink: "",
      estado: "Disponible",
      start: "2025-02-01T13:00:00.000Z",
      end: "2025-02-01T14:00:00.000Z",
      comentarios: "",
    });

    const response = await deleteTurno(created.id);
    expect(response).toEqual({ success: true });
  });
});
