import { getBackendClient, resolveAuthSession } from "./realBackendSession";

// Cache breve por rol para evitar múltiples logins en los mismos tests
const localSessionCache = new Map();
const LOCAL_CACHE_TTL_MS = 2 * 60_000;

async function getSessionCached(auth) {
  const normalizedRole = (auth?.role || "superadmin").toLowerCase();
  const key = `${normalizedRole}`;
  const cached = localSessionCache.get(key);
  if (cached && cached.expires > Date.now()) {
    return cached.session;
  }
  const session = await resolveAuthSession({ role: normalizedRole }, { persist: false });
  localSessionCache.set(key, { session, expires: Date.now() + LOCAL_CACHE_TTL_MS });
  return session;
}

const DEFAULT_AUTH = { role: "superadmin" };

const requestWithAuth = async (config, options = {}) => {
  const session = await getSessionCached(options.auth ?? DEFAULT_AUTH);
  const client = getBackendClient(session?.token);
  return client.request(config);
};

export const testApi = {
  async createTurno(payload, options = {}) {
    const now = new Date();
    const defaultPayload = {
      review: 1,
      reviewNumber: 1,
      sala: "71",
      cohort: 1,
      zoomLink: "https://zoom.example.com/test",
      estado: "Disponible",
      comentarios: "Test slot",
      modulo: "FRONTEND - REACT",
      fecha: now.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }),
      date: now.toISOString(),
      startTime: "10:00",
      endTime: "11:00",
      duracion: 60,
      horario: "10:00 - 11:00",
      start: now.toISOString(),
      end: new Date(now.getTime() + 60 * 60_000).toISOString(),
      reviewStatus: "disponible",
      ...payload,
    };

    const response = await requestWithAuth(
      { method: "post", url: "/slots", data: defaultPayload },
      options
    );
    return response.data;
  },
  async deleteTurno(id, options) {
    try {
      await requestWithAuth({ method: "delete", url: `/slots/${id}` }, options);
    } catch {
      // limpiar best-effort
    }
  },
  async listTurnos(options) {
    const response = await requestWithAuth({ method: "get", url: "/slots" }, options);
    return Array.isArray(response.data) ? response.data : [];
  },
  async createUsuario(payload, options = {}) {
    const defaultPayload = {
      name: payload.name || payload.nombre || "Test User",
      nombre: payload.name || payload.nombre || "Test User",
      email: payload.email || `test${Date.now()}@example.com`,
      password: payload.password || "Test123!",
      rol: payload.role || payload.rol || "alumno",
      role: payload.role || payload.rol || "alumno",
      cohort: typeof payload.cohort === "number" ? payload.cohort : 1,
      modulo: payload.modulo || "FRONTEND - REACT",
      approved: payload.approved ?? true,
      status: payload.status || (payload.approved === false ? "Pendiente" : "Aprobado"),
      identificador: payload.identificador,
    };

    const { disableFallback = false } = options;
    let created;
    try {
      const response = await requestWithAuth(
        { method: "post", url: "/usuarios", data: defaultPayload },
        options
      );
      created = response.data;
    } catch (e) {
      if (disableFallback) throw e;
    }
    if (!disableFallback && (!created || (!created.id && !created._id))) {
      try {
        const res2 = await requestWithAuth(
          { method: "post", url: "/auth/register", data: defaultPayload },
          options
        );
        created = res2.data;
      } catch {}
      if (!created || (!created.id && !created._id)) {
        try {
          const list = await this.listUsuarios(options);
          const found = list.find(
            (u) => String(u.email || "").toLowerCase() === String(defaultPayload.email || "").toLowerCase()
          );
          if (found) created = found;
        } catch {}
      }
    }
    return created;
  },
  async deleteUsuario(id, options) {
    try {
      await requestWithAuth({ method: "delete", url: `/usuarios/${id}` }, options);
    } catch {
      // Limpieza best-effort
    }
  },
  async listUsuarios(options) {
    const response = await requestWithAuth({ method: "get", url: "/usuarios" }, options);
    return Array.isArray(response.data) ? response.data : [];
  },
  async createEntrega(payload, options) {
    let enriched = { ...payload };
    if (!enriched.alumnoId && !enriched.alumno?.id && !enriched.alumno?._id) {
      try {
        const users = await this.listUsuarios(options);
        const alumno = users.find(
          (u) => String(u.role || u.rol || u.tipo).toLowerCase() === "alumno"
        );
        const alumnoId = alumno?.id || alumno?._id;
        if (alumnoId) enriched.alumnoId = alumnoId;
      } catch {
        // continuar sin enriquecer si falla
      }
    }

    const response = await requestWithAuth(
      { method: "post", url: "/entregas", data: enriched },
      options
    );
    return response.data;
  },
  async updateEntrega(id, payload, options) {
    const response = await requestWithAuth(
      { method: "put", url: `/entregas/${id}`, data: payload },
      options
    );
    return response.data;
  },
  async deleteEntrega(id, options) {
    try {
      await requestWithAuth({ method: "delete", url: `/entregas/${id}` }, options);
    } catch {
      // Ignorar errores de cleanup
    }
  },
  async listEntregas(options) {
    const response = await requestWithAuth({ method: "get", url: "/entregas" }, options);
    return Array.isArray(response.data) ? response.data : [];
  },
};

