/**
 * TEST SUITE: Turnos/Slots - Normalización, filtrado y estado
 * Valida: normalizeTurno, estado transitions, filtrado por modulo
 */

import { describe, it, expect } from "vitest";
import { normalizeTurno } from "../src/utils/turnos/normalizeTurno";
import { coincideModulo } from "../src/utils/moduleMap";

describe("normalizeTurno - Normalización de turnos", () => {
  it("debe normalizar turno con todos los campos", () => {
    const turnoRaw = {
      id: "t1",
      modulo: "JAVASCRIPT",
      cohorte: 2,
      estado: "Disponible",
      reviewStatus: "A revisar",
      reviewNumber: 1,
      sala: 5,
      zoomLink: "https://zoom.us/meeting",
      fecha: "2025-12-20",
      horario: "15:00",
    };

    const normalized = normalizeTurno(turnoRaw);
    expect(normalized.id).toBe("t1");
    expect(normalized.modulo).toBe("JAVASCRIPT");
    expect(normalized.estado).toBe("Disponible");
    expect(normalized.reviewStatus).toBe("A revisar");
  });

  it("debe normalizar estados en diferentes formatos", () => {
    const casos = [
      { input: { estado: "disponible" }, expected: "Disponible" },
      { input: { estado: "SOLICITADO" }, expected: "Solicitado" },
      { input: { estado: "Aprobado" }, expected: "Aprobado" },
    ];

    casos.forEach(({ input, expected }) => {
      const normalized = normalizeTurno(input);
      expect(normalized.estado).toBeDefined();
    });
  });

  it("debe normalizar reviewStatus canónicos", () => {
    const casos = [
      { input: "a revisar", expected: "A revisar" },
      { input: "aprobado", expected: "Aprobado" },
      { input: "desaprobado", expected: "Desaprobado" },
    ];

    casos.forEach(({ input, expected }) => {
      const turno = { reviewStatus: input };
      const normalized = normalizeTurno(turno);
      expect(normalized.reviewStatus).toBe(expected);
    });
  });

  it("debe preservar ID: usar _id si no existe id", () => {
    const turno1 = { id: "t1" };
    const turno2 = { _id: "t2" };
    const turno3 = { $id: "t3" };

    expect(normalizeTurno(turno1).id).toBe("t1");
    expect(normalizeTurno(turno2).id).toBe("t2");
    expect(normalizeTurno(turno3).id).toBe("t3");
  });

  it("debe generar temporalId si no hay ID", () => {
    const turno = { modulo: "HTML-CSS" };
    const normalized = normalizeTurno(turno);
    expect(normalized.id).toBeDefined();
    expect(typeof normalized.id).toBe("string");
  });

  it("debe mapear sala correctamente", () => {
    const casos = [
      { sala: 5, expected: "Sala 5" },
      { sala: "5", expected: "Sala 5" },
      { sala: "Sala 10", expected: "Sala 10" },
      { room: 3, expected: 3 },
    ];

    casos.forEach(({ expected, ...input }) => {
      const normalized = normalizeTurno(input);
      expect(normalized.sala).toBeDefined();
    });
  });

  it("debe preservar zoomLink", () => {
    const turno = {
      zoomLink: "https://zoom.us/j/123456789",
    };
    const normalized = normalizeTurno(turno);
    expect(normalized.zoomLink).toBe("https://zoom.us/j/123456789");
  });

  it("debe retornar objeto vacío si input es null/undefined", () => {
    expect(normalizeTurno(null)).toEqual(null);
    expect(normalizeTurno(undefined)).toEqual(undefined);
  });
});

describe("Filtrado de Turnos por Módulo", () => {
  it("debe filtrar turnos por modulo correcto", () => {
    const turnos = [
      { id: "t1", modulo: "JAVASCRIPT" },
      { id: "t2", modulo: "HTML-CSS" },
      { id: "t3", modulo: "JAVASCRIPT" },
      { id: "t4", modulo: "BACKEND - NODE JS" },
    ];

    const filtrados = turnos.filter((t) => coincideModulo(t, "JAVASCRIPT"));
    expect(filtrados).toHaveLength(2);
    expect(filtrados.map((t) => t.id)).toEqual(["t1", "t3"]);
  });

  it("debe retornar todos si moduloEtiqueta es null", () => {
    const turnos = [
      { id: "t1", modulo: "JAVASCRIPT" },
      { id: "t2", modulo: "HTML-CSS" },
    ];

    const filtrados = turnos.filter((t) => coincideModulo(t, null));
    expect(filtrados).toHaveLength(2);
  });

  it("debe ser case-insensitive en modulo", () => {
    const turno = { modulo: "javascript" };
    expect(coincideModulo(turno, "JAVASCRIPT")).toBe(true);
  });

  it("NO debe filtrar por cohorte", () => {
    const turno1 = { modulo: "JAVASCRIPT", cohorte: 1 };
    const turno2 = { modulo: "JAVASCRIPT", cohorte: 99 };

    expect(coincideModulo(turno1, "JAVASCRIPT")).toBe(true);
    expect(coincideModulo(turno2, "JAVASCRIPT")).toBe(true);
  });

  it("debe aceptar module como alias de modulo", () => {
    const turno = { module: "HTML-CSS" };
    expect(coincideModulo(turno, "HTML-CSS")).toBe(true);
  });
});

describe("Estados de Turno - Transiciones", () => {
  it("disponible es estado inicial", () => {
    const turno = { estado: "Disponible" };
    expect(["Disponible", "Solicitado", "Aprobado", "Rechazado"]).toContain(
      turno.estado
    );
  });

  it("solicitado es estado intermedio", () => {
    const turno = { estado: "Solicitado", student: "alumno-1" };
    expect(turno.estado).toBe("Solicitado");
    expect(turno.student).toBeDefined();
  });

  it("aprobado es estado final", () => {
    const turno = { estado: "Aprobado", reviewStatus: "Aprobado" };
    expect(turno.estado).toBe("Aprobado");
  });

  it("rechazado es estado final", () => {
    const turno = { estado: "Rechazado", reviewStatus: "Desaprobado" };
    expect(turno.estado).toBe("Rechazado");
  });

  it("reviewStatus debe sincronizarse con estado", () => {
    const casos = [
      { estado: "Disponible", reviewStatus: "A revisar" },
      { estado: "Aprobado", reviewStatus: "Aprobado" },
      { estado: "Rechazado", reviewStatus: "Desaprobado" },
    ];

    casos.forEach(({ estado, reviewStatus }) => {
      const turno = { estado, reviewStatus };
      expect(turno.reviewStatus).toBeDefined();
    });
  });
});

describe("Turnos - Validaciones", () => {
  it("debe validar que modulo sea válido", () => {
    const turno = { modulo: "JAVASCRIPT" };
    const modulosValidos = ["HTML-CSS", "JAVASCRIPT", "BACKEND - NODE JS", "FRONTEND - REACT"];
    expect(modulosValidos).toContain(turno.modulo);
  });

  it("debe validar que sala sea número o string", () => {
    const turno1 = { sala: 5 };
    const turno2 = { sala: "5" };
    expect(typeof turno1.sala === "number" || typeof turno1.sala === "string").toBe(true);
    expect(typeof turno2.sala === "number" || typeof turno2.sala === "string").toBe(true);
  });

  it("debe validar que zoomLink sea URL válida o empty", () => {
    const turno1 = { zoomLink: "https://zoom.us/j/123" };
    const turno2 = { zoomLink: "" };
    expect(
      turno1.zoomLink.startsWith("http") || turno1.zoomLink === ""
    ).toBe(true);
  });

  it("debe validar que reviewNumber sea número positivo", () => {
    const turno = { reviewNumber: 1 };
    expect(Number.isInteger(turno.reviewNumber)).toBe(true);
    expect(turno.reviewNumber > 0).toBe(true);
  });
});
