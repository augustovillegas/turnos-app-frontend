/* eslint-env node */
import { getBackendClient, resolveAuthSession } from "./realBackendSession.js";
import { ensureModuleLabel } from "../../src/utils/moduleMap.js";
import { buildSlotPayload, normalizeSlotPayload } from "./slotPayload.js";

const asNumber = (v) => {
  const n = Number(String(v ?? "").trim());
  return Number.isFinite(n) ? Math.trunc(n) : null;
};

const pick = (obj, keys = []) =>
  keys.reduce((acc, k) => {
    if (obj[k] !== undefined) acc[k] = obj[k];
    return acc;
  }, {});

const withAuthClient = async (auth) => {
  if (!auth) return getBackendClient();
  const session = await resolveAuthSession(auth, { persist: false });
  const token = session?.token;
  return getBackendClient(token);
};

const mapUsuarioPayload = (payload = {}) => {
  const modulo = ensureModuleLabel(payload.modulo);
  const cohorte = asNumber(payload.cohorte ?? payload.cohort);
  const estado = payload.estado ?? payload.status;
  return {
    nombre: payload.nombre ?? payload.name ?? "",
    email: payload.email ?? "",
    password: payload.password,
    rol: payload.rol ?? payload.role ?? payload.tipo ?? "alumno",
    ...(estado ? { estado, status: estado } : {}),
    ...(cohorte ? { cohorte } : {}),
    ...(modulo ? { modulo } : {}),
  };
};

const mapTurnoPayload = (payload = {}) => {
  // Merge defaults for a valid slot payload
  const base = buildSlotPayload({
    review: payload.review ?? payload.reviewNumber ?? 1,
    modulo: ensureModuleLabel(payload.modulo) || "HTML-CSS",
    cohorte: asNumber(payload.cohorte ?? payload.cohort) || 1,
    sala: payload.sala ?? payload.room,
  });
  const resolved = normalizeSlotPayload({ ...base, ...payload });
  // Backend expects reviewNumber
  const clean = {
    reviewNumber: resolved.reviewNumber,
    fecha: resolved.fecha,
    start: resolved.start,
    end: resolved.end,
    startTime: resolved.startTime,
    endTime: resolved.endTime,
    horario: resolved.horario,
    sala: resolved.sala,
    zoomLink: resolved.zoomLink,
    comentarios: resolved.comentarios,
    modulo: ensureModuleLabel(resolved.modulo) || "HTML-CSS",
    cohorte: asNumber(resolved.cohorte) || 1,
    estado: resolved.estado || "Disponible",
  };
  return clean;
};

const toId = (e) => e?.id ?? e?._id ?? e?._id?.$oid ?? null;

export const testApi = {
  // Usuarios
  async listUsuarios(params = {}, { auth = { role: "superadmin" } } = {}) {
    const client = await withAuthClient(auth);
    const res = await client.get("/usuarios", { params });
    return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
  },
  async createUsuario(payload = {}, { auth = { role: "superadmin" } } = {}) {
    const client = await withAuthClient(auth);
    const data = mapUsuarioPayload(payload);
    try {
      const res = await client.post("/usuarios", data);
      return res.data;
    } catch (err) {
      if (err?.response?.status === 404) {
        const res = await client.post("/auth/register", data);
        return res.data;
      }
      throw err;
    }
  },
  async deleteUsuario(id, { auth = { role: "superadmin" } } = {}) {
    const client = await withAuthClient(auth);
    const target = typeof id === "string" ? id : toId(id);
    await client.delete(`/usuarios/${target}`);
    return true;
  },

  // Turnos (Slots)
  async listTurnos(params = {}, { auth = { role: "profesor" } } = {}) {
    const client = await withAuthClient(auth);
    const res = await client.get("/slots", { params });
    return Array.isArray(res.data) ? res.data : res.data?.items ?? [];
  },
  async createTurno(payload = {}, { auth = { role: "profesor" } } = {}) {
    const client = await withAuthClient(auth);
    const data = mapTurnoPayload(payload);
    const res = await client.post("/slots", data);
    return res.data;
  },
  async deleteTurno(id, { auth = { role: "profesor" } } = {}) {
    const client = await withAuthClient(auth);
    const target = typeof id === "string" ? id : toId(id);
    await client.delete(`/slots/${target}`);
    return true;
  },

  // Entregas (Submissions)
  async createEntrega(payload = {}, { auth = { role: "alumno" } } = {}) {
    const alumnoClient = await withAuthClient(auth);
    let slotId = payload.slotId ?? payload.turnoId ?? payload.slot;

    // Si no hay slotId, crear y reservar uno automáticamente
    if (!slotId) {
      const slot = await this.createTurno(
        {
          review: payload.review ?? 1,
          modulo: ensureModuleLabel(payload.modulo) || "HTML-CSS",
          cohorte: asNumber(payload.cohorte ?? payload.cohort) || 1,
          comentarios: payload.comentarios ?? "Slot auto para entrega",
        },
        { auth: { role: "profesor" } }
      );
      const createdId = toId(slot);
      if (!createdId) throw new Error("No se pudo crear slot para la entrega");
      try {
        // Reservar como alumno
        await alumnoClient.patch(`/slots/${createdId}/solicitar`);
        slotId = createdId;
      } catch (err) {
        // si reserva falla (403), propagar para que el test pueda omitir
        err.__slotReserveFailed = true;
        throw err;
      }
    }

    const body = {
      sprint: payload.sprint ?? 1,
      githubLink: payload.githubLink ?? payload.github ?? "https://github.com/e2e/repo",
      renderLink: payload.renderLink ?? payload.render ?? "https://render.example.com/app",
      comentarios: payload.comentarios ?? payload.comment ?? "",
      estado: payload.estado ?? payload.status ?? "A revisar",
      reviewStatus: payload.reviewStatus ?? "A revisar",
      slotId,
    };

    const res = await alumnoClient.post("/entregas", body);
    return res.data;
  },
  async deleteEntrega(id, { auth = { role: "superadmin" } } = {}) {
    const client = await withAuthClient(auth);
    const target = typeof id === "string" ? id : toId(id);
    await client.delete(`/entregas/${target}`);
    return true;
  },
};

export default testApi;
