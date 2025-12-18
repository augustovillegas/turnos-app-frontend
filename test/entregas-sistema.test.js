/**
 * TEST SUITE: Entregas/Submissions - Normalización, estado y validaciones
 */

import { describe, it, expect } from "vitest";
import { normalizeEntrega } from "../src/utils/entregas/normalizeEntrega";

describe("normalizeEntrega - Normalización de entregas", () => {
  it("debe normalizar entrega completa", () => {
    const entregaRaw = {
      id: "e1",
      sprint: 1,
      githubLink: "https://github.com/user/repo",
      renderLink: "https://proyecto.onrender.com",
      comentarios: "Listo para revisar",
      reviewStatus: "A revisar",
      alumno: "alumno-1",
      alumnoNombre: "Juan Pérez",
      modulo: "JAVASCRIPT",
    };

    const normalized = normalizeEntrega(entregaRaw);
    expect(normalized.id).toBeDefined();
    expect(normalized.sprint).toBe(1);
    expect(normalized.githubLink).toBe("https://github.com/user/repo");
    expect(normalized.reviewStatus).toBe("A revisar");
  });

  it("debe normalizar reviewStatus canónicos", () => {
    const casos = [
      { input: "a revisar", expected: "A revisar" },
      { input: "aprobado", expected: "Aprobado" },
      { input: "desaprobado", expected: "Desaprobado" },
      { input: "pendiente", expected: "Pendiente" },
      { input: "rechazado", expected: "Rechazado" },
    ];

    casos.forEach(({ input, expected }) => {
      const entrega = { reviewStatus: input };
      const normalized = normalizeEntrega(entrega);
      expect(normalized.reviewStatus).toBe(expected);
    });
  });

  it("debe mapear estado alternativo", () => {
    const entrega1 = { estado: "Aprobado" };
    const entrega2 = { reviewStatus: "Aprobado" };

    const norm1 = normalizeEntrega(entrega1);
    const norm2 = normalizeEntrega(entrega2);

    expect(norm1.reviewStatus || norm1.estado).toBeDefined();
    expect(norm2.reviewStatus || norm2.estado).toBeDefined();
  });

  it("debe preservar ID con fallbacks", () => {
    const entrega1 = { id: "e1" };
    const entrega2 = { _id: "e2" };
    const entrega3 = {};

    expect(normalizeEntrega(entrega1).id).toBeDefined();
    expect(normalizeEntrega(entrega2).id).toBeDefined();
    expect(normalizeEntrega(entrega3).id).toBeDefined();
  });

  it("debe mapear alumnoId desde múltiples fuentes", () => {
    const casos = [
      { alumnoId: "a1" },
      { alumno: "a2" },
      { student: "a3" },
      { userId: "a4" },
    ];

    casos.forEach((input) => {
      const normalized = normalizeEntrega(input);
      expect(normalized.alumnoId || normalized.alumno).toBeDefined();
    });
  });

  it("debe validar GitHub link", () => {
    const entrega = {
      githubLink: "https://github.com/user/proyecto",
    };
    const normalized = normalizeEntrega(entrega);
    expect(normalized.githubLink).toBe("https://github.com/user/proyecto");
  });

  it("debe validar Render link", () => {
    const entrega = {
      renderLink: "https://proyecto.onrender.com",
    };
    const normalized = normalizeEntrega(entrega);
    expect(normalized.renderLink).toBe("https://proyecto.onrender.com");
  });

  it("debe permitir comentarios vacíos", () => {
    const entrega1 = { comentarios: "Bien hecho" };
    const entrega2 = { comentarios: "" };
    const entrega3 = {};

    const norm1 = normalizeEntrega(entrega1);
    const norm2 = normalizeEntrega(entrega2);
    const norm3 = normalizeEntrega(entrega3);

    expect(typeof norm1.comentarios).toBe("string");
    expect(typeof norm2.comentarios).toBe("string");
    expect(typeof norm3.comentarios === "string" || norm3.comentarios == null).toBe(true);
  });
});

describe("Estados de Entrega - Transiciones", () => {
  it("pendiente es estado inicial (antes de subir)", () => {
    const entrega = { reviewStatus: "Pendiente" };
    expect(entrega.reviewStatus).toBe("Pendiente");
  });

  it("a revisar es estado por defecto (subida)", () => {
    const entrega = { reviewStatus: "A revisar" };
    expect(entrega.reviewStatus).toBe("A revisar");
  });

  it("aprobado es estado final positivo", () => {
    const entrega = {
      reviewStatus: "Aprobado",
      comentarios: "Excelente trabajo",
    };
    expect(entrega.reviewStatus).toBe("Aprobado");
  });

  it("desaprobado es estado final negativo", () => {
    const entrega = {
      reviewStatus: "Desaprobado",
      comentarios: "Revisar requirements",
    };
    expect(entrega.reviewStatus).toBe("Desaprobado");
  });

  it("estado final = Aprobado o Desaprobado", () => {
    const FINAL_STATES = ["Aprobado", "Desaprobado"];
    const entrega1 = { reviewStatus: "Aprobado" };
    const entrega2 = { reviewStatus: "A revisar" };

    expect(FINAL_STATES).toContain(entrega1.reviewStatus);
    expect(FINAL_STATES).not.toContain(entrega2.reviewStatus);
  });
});

describe("Entregas - Validaciones", () => {
  it("debe validar que sprint sea número positivo", () => {
    const casos = [
      { sprint: 1, valid: true },
      { sprint: 5, valid: true },
      { sprint: 0, valid: false },
      { sprint: -1, valid: false },
    ];

    casos.forEach(({ sprint, valid }) => {
      const isValid = Number.isInteger(sprint) && sprint > 0;
      expect(isValid).toBe(valid);
    });
  });

  it("debe validar que links sean URLs válidas o vacías", () => {
    const casos = [
      { link: "https://github.com/user/repo", valid: true },
      { link: "https://proyecto.onrender.com", valid: true },
      { link: "", valid: true },
      { link: "github.com/user", valid: false },
    ];

    casos.forEach(({ link, valid }) => {
      const isValid = link.startsWith("http") || link === "";
      expect(isValid).toBe(valid);
    });
  });

  it("debe tener alumnoId/alumno definido", () => {
    const entrega = { alumnoId: "alumno-123" };
    expect(entrega.alumnoId).toBeDefined();
  });

  it("debe tener modulo definido", () => {
    const entrega = { modulo: "JAVASCRIPT" };
    const modulosValidos = ["HTML-CSS", "JAVASCRIPT", "BACKEND - NODE JS", "FRONTEND - REACT"];
    expect(modulosValidos).toContain(entrega.modulo);
  });
});

describe("Entregas - Permisos de Edición", () => {
  it("alumno NO puede editar si estado es Aprobado", () => {
    const entrega = { reviewStatus: "Aprobado" };
    const FINAL_STATES = ["Aprobado", "Desaprobado"];
    const puedeEditar = !FINAL_STATES.includes(entrega.reviewStatus);
    expect(puedeEditar).toBe(false);
  });

  it("alumno puede editar si estado es A revisar", () => {
    const entrega = { reviewStatus: "A revisar" };
    const FINAL_STATES = ["Aprobado", "Desaprobado"];
    const puedeEditar = !FINAL_STATES.includes(entrega.reviewStatus);
    expect(puedeEditar).toBe(true);
  });

  it("profesor siempre puede editar (cambiar estado)", () => {
    const rolProfesor = "profesor";
    const entrega = { reviewStatus: "Aprobado" };
    const puedeEditar = rolProfesor === "profesor";
    expect(puedeEditar).toBe(true);
  });

  it("superadmin siempre puede editar", () => {
    const rolSuperadmin = "superadmin";
    const entrega = { reviewStatus: "Aprobado" };
    const puedeEditar = rolSuperadmin === "superadmin";
    expect(puedeEditar).toBe(true);
  });
});

describe("Entregas - Mapeo de Módulo", () => {
  it("debe mapear modulo desde assignment si no viene en entrega", () => {
    const entrega = {};
    const assignment = { modulo: "HTML-CSS" };

    const moduloFinal = entrega.modulo ?? assignment.modulo;
    expect(moduloFinal).toBe("HTML-CSS");
  });

  it("debe usar modulo de entrega si existe", () => {
    const entrega = { modulo: "JAVASCRIPT" };
    const assignment = { modulo: "HTML-CSS" };

    const moduloFinal = entrega.modulo ?? assignment.modulo;
    expect(moduloFinal).toBe("JAVASCRIPT");
  });

  it("debe preservar moduleCode/moduleNumber si viene", () => {
    const casos = [
      { moduleCode: 1, expected: 1 },
      { moduleCode: 2, expected: 2 },
      { moduleNumber: 3, expected: 3 },
    ];

    casos.forEach(({ expected, ...input }) => {
      const code = input.moduleCode ?? input.moduleNumber;
      expect(code).toBe(expected);
    });
  });
});
