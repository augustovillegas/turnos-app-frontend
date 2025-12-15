import { describe, it, expect } from "vitest";
import { mapUsuario } from "../helpers";

describe("mapUsuario cohorte handling", () => {
  it("no deriva cohorte desde modulo cuando la respuesta no lo trae", () => {
    const usuario = {
      id: "u1",
      nombre: "Solo Modulo",
      modulo: "JAVASCRIPT",
      // sin cohorte/cohort
    };

    const mapped = mapUsuario(usuario);

    expect(mapped.cohorte).toBeNull();
    expect(mapped.modulo).toBe("JAVASCRIPT");
  });
});
