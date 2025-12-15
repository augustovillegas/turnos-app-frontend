import { describe, it, expect, vi, beforeEach } from "vitest";

const getMock = vi.fn();

vi.mock("../apiClient", () => ({
  apiClient: {
    get: getMock,
  },
}));

import { getUsuarios } from "../usuariosService";

describe("getUsuarios enrichment", () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it("enriquece cohorte/modulo con el endpoint alternativo cuando faltan en el principal", async () => {
    // Primera llamada (primary) sin cohorte/modulo
    getMock
      .mockResolvedValueOnce({
        data: [{ id: "1", email: "a@test.com", nombre: "A", cohorte: null, modulo: null }],
      })
      // Segunda llamada (secondary) con datos completos
      .mockResolvedValueOnce({
        data: [{ id: "1", email: "a@test.com", nombre: "A", cohorte: 3, modulo: "JAVASCRIPT" }],
      });

    const result = await getUsuarios({}, { preferAuth: false });

    expect(getMock).toHaveBeenCalledTimes(2);
    expect(result[0].cohorte).toBe(3);
    expect(result[0].cohort).toBe(3);
    expect(result[0].modulo).toBe("JAVASCRIPT");
  });

  it("no hace llamada extra si el primary ya trae cohorte", async () => {
    getMock.mockResolvedValueOnce({
      data: [{ id: "1", email: "a@test.com", nombre: "A", cohorte: 2, modulo: "HTML-CSS" }],
    });

    const result = await getUsuarios({}, { preferAuth: false });

    expect(getMock).toHaveBeenCalledTimes(1);
    expect(result[0].cohorte).toBe(2);
    expect(result[0].modulo).toBe("HTML-CSS");
  });
});
