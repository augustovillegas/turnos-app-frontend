// === MSW Handlers ===
// Define las respuestas simuladas para los servicios HTTP usados en las pruebas.

import { HttpResponse, http } from "msw";
import { cloneFixtures, nextTurnoId } from "./fixtures";

let state = cloneFixtures();

export const resetMockState = () => {
  state = cloneFixtures();
};

const buildJsonResponse = (payload, init) =>
  HttpResponse.json(payload, {
    status: 200,
    headers: { "Content-Type": "application/json" },
    ...init,
  });

export const handlers = [
  // --- Turnos CRUD ---
  http.get("*/turnos", ({ request }) => {
    const url = new URL(request.url);
    const reviewFilter = url.searchParams.get("review");
    const modulo = url.searchParams.get("modulo");
    let turnos = [...state.turnos];

    if (reviewFilter) {
      turnos = turnos.filter(
        (turno) => String(turno.review) === String(reviewFilter)
      );
    }

    if (modulo) {
      turnos = turnos.map((turno) => ({
        ...turno,
        modulo,
      }));
    }

    return buildJsonResponse(turnos);
  }),

  http.get("*/turnos/:id", ({ params }) => {
    const target = state.turnos.find(
      (turno) => String(turno.id) === String(params.id)
    );
    if (!target) {
      return buildJsonResponse(
        { message: `Turno ${params.id} no encontrado` },
        { status: 404 }
      );
    }
    return buildJsonResponse(target);
  }),

  http.post("*/turnos", async ({ request }) => {
    const payload = await request.json();
    const id = payload.id ?? nextTurnoId();
    const normalized = {
      ...payload,
      id,
      estado: payload.estado || "Disponible",
      comentarios: payload.comentarios || "",
    };

    state.turnos.push(normalized);
    return buildJsonResponse(normalized, { status: 201 });
  }),

  http.put("*/turnos/:id", async ({ params, request }) => {
    const payload = await request.json();
    const index = state.turnos.findIndex(
      (turno) => String(turno.id) === String(params.id)
    );
    if (index === -1) {
      return buildJsonResponse(
        { message: `Turno ${params.id} no encontrado` },
        { status: 404 }
      );
    }

    const updated = {
      ...state.turnos[index],
      ...payload,
      id: state.turnos[index].id,
    };
    state.turnos[index] = updated;
    return buildJsonResponse(updated);
  }),

  http.delete("*/turnos/:id", ({ params }) => {
    state.turnos = state.turnos.filter(
      (turno) => String(turno.id) !== String(params.id)
    );
    return buildJsonResponse({ success: true });
  }),

  // --- Entregas ---
  http.get("*/entregas", () => buildJsonResponse(state.entregas)),

  // --- Usuarios ---
  http.get("*/usuarios", () => buildJsonResponse(state.usuarios)),
];
