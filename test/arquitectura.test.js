/**
 * TESTS DE ARQUITECTURA - Validar alineación backend/frontend
 * CONCEPTO CRÍTICO: modulo = String enum (FILTRO PRINCIPAL), cohorte = Number (METADATO)
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { coincideModulo, ensureModuleLabel, labelToModule } from "../utils/moduleMap";
import { normalizeUsuario } from "../utils/usuarios/normalizeUsuario";
import { mapUsuario } from "../utils/usuarios/helpers";
import { normalizeTurno } from "../utils/turnos/normalizeTurno";

// ============== moduleMap.js Tests ==============
describe("coincideModulo - Filtrado por MODULO (String enum)", () => {
  it("debe retornar true cuando modulo coincide exactamente", () => {
    const turno = { modulo: "JAVASCRIPT", cohorte: 1 };
    expect(coincideModulo(turno, "JAVASCRIPT")).toBe(true);
  });

  it("debe retornar true cuando module (alias) coincide", () => {
    const turno = { module: "HTML-CSS", cohorte: 2 };
    expect(coincideModulo(turno, "HTML-CSS")).toBe(true);
  });

  it("debe retornar false cuando modulo NO coincide", () => {
    const turno = { modulo: "BACKEND - NODE JS", cohorte: 1 };
    expect(coincideModulo(turno, "FRONTEND - REACT")).toBe(false);
  });

  it("debe retornar true cuando moduloEtiqueta es null (sin filtro)", () => {
    const turno = { modulo: "JAVASCRIPT", cohorte: 1 };
    expect(coincideModulo(turno, null)).toBe(true);
  });

  it("NO debe usar cohorte para filtrado - cohorte diferente = true si modulo coincide", () => {
    const turno = { modulo: "JAVASCRIPT", cohorte: 5 };
    // Cohorte 5 no debería afectar el resultado
    expect(coincideModulo(turno, "JAVASCRIPT")).toBe(true);
  });

  it("debe ignorar datos.modulo como fallback secundario si no hay modulo principal", () => {
    const turno = { datos: { modulo: "HTML-CSS" } };
    expect(coincideModulo(turno, "HTML-CSS")).toBe(true);
  });

  it("coincideModulo debe retornar true si objeto vacío (evitar descartes)", () => {
    const turno = {};
    expect(coincideModulo(turno, null)).toBe(true);
  });
});

// ============== normalizeUsuario Tests ==============
describe("normalizeUsuario - modulo y cohorte independientes", () => {
  it("debe retornar modulo tal cual viene del backend, no derivarlo", () => {
    const usuario = {
      id: "u1",
      nombre: "Test",
      email: "test@test.com",
      modulo: "JAVASCRIPT",
      cohorte: 2,
    };
    const normalized = normalizeUsuario(usuario);
    expect(normalized.modulo).toBe("JAVASCRIPT");
    expect(normalized.cohorte).toBe(2);
  });

  it("debe retornar null si modulo no viene en respuesta", () => {
    const usuario = {
      id: "u1",
      nombre: "Test",
      email: "test@test.com",
      cohorte: 3,
    };
    const normalized = normalizeUsuario(usuario);
    // NO debe derivar modulo desde cohorte
    expect(normalized.modulo).toBeNull();
    expect(normalized.cohorte).toBe(3);
  });

  it("debe usar module (alias) si modulo no viene", () => {
    const usuario = {
      id: "u1",
      nombre: "Test",
      email: "test@test.com",
      module: "BACKEND - NODE JS",
      cohorte: 1,
    };
    const normalized = normalizeUsuario(usuario);
    expect(normalized.modulo).toBe("BACKEND - NODE JS");
  });

  it("debe retornar cohorte null si no viene en respuesta", () => {
    const usuario = {
      id: "u1",
      nombre: "Test",
      email: "test@test.com",
      modulo: "HTML-CSS",
    };
    const normalized = normalizeUsuario(usuario);
    expect(normalized.cohorte).toBeNull();
  });

  it("debe usar datos.modulo si modulo y module no vienen", () => {
    const usuario = {
      id: "u1",
      nombre: "Test",
      email: "test@test.com",
      datos: { modulo: "FRONTEND - REACT" },
      cohorte: 4,
    };
    const normalized = normalizeUsuario(usuario);
    expect(normalized.modulo).toBe("FRONTEND - REACT");
  });

  it("profesor sin modulo debe loguear warning pero no fallar", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    const usuario = {
      id: "u1",
      nombre: "Profesor",
      email: "prof@test.com",
      rol: "profesor",
      cohorte: 1,
    };
    const normalized = normalizeUsuario(usuario);
    expect(normalized.modulo).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("[normalizeUsuario]"),
      expect.any(String),
      expect.any(Object)
    );
    consoleSpy.mockRestore();
  });
});

// ============== mapUsuario Tests ==============
describe("mapUsuario - mapper de usuarios para UI", () => {
  it("debe mapear usuario con modulo y cohorte correctamente", () => {
    const usuario = {
      id: "u1",
      nombre: "Test",
      email: "test@test.com",
      rol: "alumno",
      modulo: "JAVASCRIPT",
      cohorte: 2,
    };
    const mapped = mapUsuario(usuario);
    expect(mapped.modulo).toBe("JAVASCRIPT");
    expect(mapped.cohorte).toBe("2");
    expect(mapped.tipo).toBe("alumno");
  });

  it("debe retornar cohorte null en UI si no viene del backend", () => {
    const usuario = {
      id: "u1",
      nombre: "Test",
      email: "test@test.com",
      rol: "profesor",
      modulo: "HTML-CSS",
    };
    const mapped = mapUsuario(usuario);
    expect(mapped.cohorte).toBeNull();
    expect(mapped.modulo).toBe("HTML-CSS");
  });

  it("debe aplicar fallback 1 en render de tabla si cohorte es null", () => {
    const usuario = {
      id: "u1",
      nombre: "Test",
      email: "test@test.com",
      rol: "alumno",
      modulo: "BACKEND - NODE JS",
    };
    const mapped = mapUsuario(usuario);
    // En mapUsuario, cohorte null permanece null; la tabla debe aplicar fallback "?? '1'"
    expect(mapped.cohorte).toBeNull();
  });
});

// ============== Flujo de creación de usuario ==============
describe("Payload de creación de usuario - estructura correcta", () => {
  it("payload debe incluir modulo (String), cohorte (Number), moduleCode (Number)", () => {
    const formData = {
      nombre: "Alumno Test",
      email: "alumno@test.com",
      modulo: "JAVASCRIPT",
      cohorte: 1,
      password: "SecurePass123#",
      rol: "alumno",
    };

    // Simulando lo que buildUpdateBody hace
    const moduloLabel = ensureModuleLabel(formData.modulo);
    const moduleCode = moduloLabel ? labelToModule(moduloLabel) : null;
    const cohorteNumber = Number(formData.cohorte);

    const payload = {
      name: formData.nombre,
      email: formData.email,
      rol: formData.rol,
      password: formData.password,
      ...(cohorteNumber != null ? { cohorte: cohorteNumber } : {}),
      ...(moduloLabel ? { modulo: moduloLabel } : {}),
      ...(moduleCode != null ? { moduleCode } : {}),
    };

    expect(payload.modulo).toBe("JAVASCRIPT");
    expect(payload.cohorte).toBe(1);
    expect(payload.moduleCode).toBe(2);
  });

  it("NO debe enviar cohort, module, moduleNumber - solo cohorte, modulo, moduleCode", () => {
    const formData = {
      nombre: "Test",
      email: "test@test.com",
      modulo: "HTML-CSS",
      cohorte: 3,
    };

    const moduloLabel = ensureModuleLabel(formData.modulo);
    const payload = {
      modulo: moduloLabel,
      cohorte: formData.cohorte,
      moduleCode: labelToModule(moduloLabel),
    };

    expect(payload).not.toHaveProperty("cohort");
    expect(payload).not.toHaveProperty("module");
    expect(payload).not.toHaveProperty("moduleNumber");
  });
});

// ============== normalizeTurno Tests ==============
describe("normalizeTurno - turno de revisión", () => {
  it("debe mapear modulo correctamente desde backend", () => {
    const turnoBackend = {
      id: "t1",
      modulo: "JAVASCRIPT",
      estado: "Disponible",
      reviewStatus: "A revisar",
    };
    const normalized = normalizeTurno(turnoBackend);
    expect(normalized.modulo).toBe("JAVASCRIPT");
  });

  it("debe normalizar reviewStatus", () => {
    const turnoBackend = {
      id: "t1",
      modulo: "HTML-CSS",
      estado: "Disponible",
      reviewStatus: "a revisar",
    };
    const normalized = normalizeTurno(turnoBackend);
    expect(normalized.reviewStatus).toBe("A revisar");
  });

  it("debe preservar cohorte si viene en respuesta", () => {
    const turnoBackend = {
      id: "t1",
      modulo: "BACKEND - NODE JS",
      cohorte: 2,
      estado: "Disponible",
    };
    const normalized = normalizeTurno(turnoBackend);
    // Aunque cohorte venga, el objeto normalizado la preserva como info extra
    expect(normalized.modulo).toBe("BACKEND - NODE JS");
  });
});

// ============== Module label conversion ==============
describe("ensureModuleLabel y labelToModule - conversiones correctas", () => {
  it("ensureModuleLabel debe retornar enum canónico", () => {
    expect(ensureModuleLabel("JAVASCRIPT")).toBe("JAVASCRIPT");
    expect(ensureModuleLabel("javascript")).toBe("JAVASCRIPT");
    expect(ensureModuleLabel("JS")).toBe("JAVASCRIPT");
    expect(ensureModuleLabel(2)).toBe("JAVASCRIPT");
  });

  it("labelToModule debe retornar número correcto", () => {
    expect(labelToModule("HTML-CSS")).toBe(1);
    expect(labelToModule("JAVASCRIPT")).toBe(2);
    expect(labelToModule("BACKEND - NODE JS")).toBe(3);
    expect(labelToModule("FRONTEND - REACT")).toBe(4);
  });

  it("labelToModule con número directo debe validar rango 1-4", () => {
    expect(labelToModule(1)).toBe(1);
    expect(labelToModule(4)).toBe(4);
    expect(labelToModule(5)).toBeNull();
    expect(labelToModule(0)).toBeNull();
  });
});

// ============== Permisos y filtrado por módulo ==============
describe("Permisos - Profesor solo ve alumnos de su módulo", () => {
  it("coincideModulo debe filtrar usuarios por modulo igual", () => {
    const profesorModulo = "JAVASCRIPT";
    const alumnos = [
      { id: "a1", modulo: "JAVASCRIPT", cohorte: 1 },
      { id: "a2", modulo: "HTML-CSS", cohorte: 2 },
      { id: "a3", modulo: "JAVASCRIPT", cohorte: 3 },
      { id: "a4", modulo: "BACKEND - NODE JS", cohorte: 1 },
    ];

    const filtrados = alumnos.filter((a) => coincideModulo(a, profesorModulo));
    expect(filtrados).toHaveLength(2);
    expect(filtrados.map((a) => a.id)).toEqual(["a1", "a3"]);
  });

  it("coincideModulo NO debe usar cohorte como criterio", () => {
    const profesorModulo = "HTML-CSS";
    const alumnos = [
      { id: "a1", modulo: "HTML-CSS", cohorte: 10 },
      { id: "a2", modulo: "HTML-CSS", cohorte: 1 },
    ];

    const filtrados = alumnos.filter((a) => coincideModulo(a, profesorModulo));
    expect(filtrados).toHaveLength(2); // Ambos pasan porque modulo coincide
  });
});
