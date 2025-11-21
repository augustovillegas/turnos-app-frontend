import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const baseURL =
  process.env.API_BASE_URL ||
  process.env.VITE_API_BASE_URL ||
  "http://localhost:3000";

const client = axios.create({
  baseURL,
  timeout: 15_000,
  validateStatus: () => true,
  headers: { "Content-Type": "application/json" },
});

const ensureCredentials = () => {
  const email = process.env.TEST_E2E_SUPERADMIN_EMAIL;
  const password = process.env.TEST_E2E_SUPERADMIN_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Define TEST_E2E_SUPERADMIN_EMAIL y TEST_E2E_SUPERADMIN_PASSWORD para usar test:api."
    );
  }
  return { email, password };
};

const authenticate = async () => {
  const credentials = ensureCredentials();
  const response = await client.post("/auth/login", {
    email: credentials.email,
    password: credentials.password,
  });

  if (![200, 201].includes(response.status) || !response.data?.token) {
    throw new Error(
      `No se pudo autenticar: status ${response.status} | ${JSON.stringify(
        response.data
      )}`
    );
  }

  client.defaults.headers.Authorization = `Bearer ${response.data.token}`;
  return response.data;
};

const state = {
  turnoId: null,
  entregaId: null,
  skipTurnos: null,
  skipEntregas: null,
};

class SkipScenario extends Error {
  constructor(message) {
    super(message);
    this.name = "SkipScenario";
  }
}

const results = [];

const expectCondition = (condition, message) => {
  if (!condition) {
    throw new Error(message);
  }
};

const registerResult = (name, status, detail = "") => {
  results.push({ name, status, detail });
};

const summary = () => {
  const failed = results.filter((item) => item.status !== "OK");
  console.table(
    results.map((item) => ({
      Escenario: item.name,
      Resultado: item.status,
      Detalle: item.detail,
    }))
  );
  if (failed.length) {
    console.error(`\n${failed.length} escenarios fallaron.`);
    process.exitCode = 1;
  } else {
    console.log("\nTodos los escenarios se ejecutaron correctamente.");
  }
};

const buildTurnoPayload = () => {
  const now = Date.now();
  const start = new Date(now + 60 * 60 * 1000);
  const end = new Date(now + 90 * 60 * 1000);
  const formatHour = (date) => date.toISOString().slice(11, 16);

  const roomNumber = Math.floor(Math.random() * 100) + 1;
  return {
    review: 77,
    fecha: start.toISOString().slice(0, 10),
    horario: `${formatHour(start)} - ${formatHour(end)}`,
    sala: roomNumber,
    zoomLink: `https://example.com/review-${now}`,
    estado: "Disponible",
    start: start.toISOString(),
    end: end.toISOString(),
    comentarios: "Generado por apiHealthTest",
    modulo: "NODE",
    cohort: "QA",
    solicitanteId: null,
    room: roomNumber,
  };
};

const buildEntregaPayload = () => {
  const now = Date.now();
  return {
    sprint: 1,
    githubLink: `https://github.com/example/repo-${now}`,
    renderLink: `https://example.com/render-${now}`,
    comentarios: "Smoke test",
    estado: "A revisar",
    modulo: "NODE",
  };
};

const requireTurnoDisponible = () => {
  if (state.skipTurnos) {
    throw new SkipScenario(state.skipTurnos);
  }
  expectCondition(state.turnoId, "no existe turno creado");
};

const requireEntregaDisponible = () => {
  if (state.skipEntregas) {
    throw new SkipScenario(state.skipEntregas);
  }
  expectCondition(state.entregaId, "no hay entrega creada");
};

const testHealth = async () => {
  const response = await client.get("/health");
  expectCondition(response.status === 200, "status distinto de 200");
  expectCondition(response.data?.status === "ok", "payload inesperado");
};

const testListTurnos = async () => {
  const response = await client.get("/turnos");
  expectCondition(
    response.status === 200,
    `status inesperado: ${response.status}`
  );
  expectCondition(Array.isArray(response.data), "no devolvió un array");
};

const testCreateTurno = async () => {
  const payload = buildTurnoPayload();
  const response = await client.post("/turnos", payload);
  if (![200, 201].includes(response.status)) {
    console.error("[apiHealthTest] createTurno payload", payload);
    console.error(
      `[apiHealthTest] createTurno status ${response.status}`,
      response.data
    );
  }
  expectCondition(
    [200, 201].includes(response.status),
    `status inesperado: ${response.status}`
  );
  expectCondition(response.data?.id, "no devolvió id");
  state.turnoId = response.data.id;
};

const testUpdateTurno = async () => {
  requireTurnoDisponible();
  const response = await client.put(`/turnos/${state.turnoId}`, {
    estado: "Solicitado",
    comentarios: "Actualizado por apiHealthTest",
  });
  expectCondition(
    response.status === 200,
    `status inesperado: ${response.status}`
  );
  expectCondition(
    response.data?.estado === "Solicitado",
    "no actualizó el estado"
  );
};

const testDeleteTurno = async () => {
  requireTurnoDisponible();
  const response = await client.delete(`/turnos/${state.turnoId}`);
  expectCondition(
    [200, 204].includes(response.status),
    `status inesperado: ${response.status}`
  );
  state.turnoId = null;
};

const testTurnoInvalidPayload = async () => {
  const response = await client.post("/turnos", {
    sala: "",
    zoomLink: "",
  });
  expectCondition(
    response.status >= 400,
    `debería fallar y devolvió ${response.status}`
  );
};

const testTurnoNotFound = async () => {
  const response = await client.get("/turnos/turno-inexistente");
  expectCondition(response.status === 404, "debería responder 404");
};

const testListEntregas = async () => {
  const response = await client.get("/entregas");
  expectCondition(response.status === 200, "status inesperado");
  expectCondition(Array.isArray(response.data), "no devolvió lista");
};

const testCreateEntrega = async () => {
  const payload = buildEntregaPayload();
  const response = await client.post("/entregas", payload);
  expectCondition(
    [200, 201].includes(response.status),
    `status inesperado: ${response.status}`
  );
  expectCondition(response.data?.id, "no devolvió id");
  state.entregaId = response.data.id;
};

const testDeleteEntrega = async () => {
  requireEntregaDisponible();
  const response = await client.delete(`/entregas/${state.entregaId}`);
  expectCondition(
    [200, 204].includes(response.status),
    `status inesperado: ${response.status}`
  );
  state.entregaId = null;
};

const testEntregaInvalid = async () => {
  const response = await client.post("/entregas", {
    comentarios: "payload invalido sin links",
  });
  expectCondition(
    response.status >= 400,
    `debería fallar y devolvió ${response.status}`
  );
};

const testListUsuarios = async () => {
  const response = await client.get("/usuarios");
  expectCondition(response.status === 200, "status inesperado");
  expectCondition(Array.isArray(response.data), "no devolvió lista");
};

const testUsuarioNotFound = async () => {
  const response = await client.get("/usuarios/usuario-inexistente");
  expectCondition(response.status === 404, "debería responder 404");
};

const scenarios = [
  { name: "Healthcheck /health", fn: testHealth },
  { name: "Listado /turnos", fn: testListTurnos },
  { name: "Crear turno válido", fn: testCreateTurno },
  { name: "Actualizar turno", fn: testUpdateTurno },
  { name: "Eliminar turno", fn: testDeleteTurno },
  { name: "Turno inválido (error)", fn: testTurnoInvalidPayload },
  { name: "Turno inexistente (404)", fn: testTurnoNotFound },
  { name: "Listado /entregas", fn: testListEntregas },
  { name: "Crear entrega válida", fn: testCreateEntrega },
  { name: "Eliminar entrega", fn: testDeleteEntrega },
  { name: "Entrega inválida (error)", fn: testEntregaInvalid },
  { name: "Listado /usuarios", fn: testListUsuarios },
  { name: "Usuario inexistente (404)", fn: testUsuarioNotFound },
];

const run = async () => {
  await authenticate();
  for (const scenario of scenarios) {
    try {
      await scenario.fn();
      registerResult(scenario.name, "OK");
    } catch (error) {
      const detail = error?.message || error?.toString() || "Error desconocido";
      if (error instanceof SkipScenario) {
        registerResult(scenario.name, "OMITIDO", detail);
      } else {
        registerResult(scenario.name, "FALLÓ", detail);
        if (scenario.name === "Crear entrega válida") {
          state.skipEntregas = `No se pudo crear la entrega: ${detail}`;
        }
        if (scenario.name === "Crear turno válido") {
          state.skipTurnos = `No se pudo crear el turno: ${detail}`;
        }
      }
    }
  }

  // Limpieza defensiva si quedó algo creado
  if (state.turnoId) {
    await client.delete(`/turnos/${state.turnoId}`).catch(() => {});
  }
  if (state.entregaId) {
    await client.delete(`/entregas/${state.entregaId}`).catch(() => {});
  }

  summary();
};

run();
