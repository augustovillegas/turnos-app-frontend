import { getBackendClient, resolveAuthSession } from "./realBackendSession";

const DEFAULT_AUTH = { role: "superadmin" };

const requestWithAuth = async (config, options = {}) => {
  const session = await resolveAuthSession(options.auth ?? DEFAULT_AUTH, {
    persist: false,
  });
  const client = getBackendClient(session?.token);
  return client.request(config);
};

export const remoteTestApi = {
  async createTurno(payload, options) {
    const response = await requestWithAuth(
      {
        method: "post",
        url: "/turnos",
        data: payload,
      },
      options
    );
    return response.data;
  },
  async deleteTurno(id, options) {
    try {
      await requestWithAuth(
        {
          method: "delete",
          url: `/turnos/${id}`,
        },
        options
      );
    } catch {
      // Ignorar errores de limpieza
    }
  },
  async listTurnos(options) {
    const response = await requestWithAuth(
      {
        method: "get",
        url: "/turnos",
      },
      options
    );
    return Array.isArray(response.data) ? response.data : [];
  },
  async createUsuario(payload, options) {
    // Usar endpoint administrativo para creación real (requiere superadmin)
    const response = await requestWithAuth(
      {
        method: "post",
        url: "/usuarios",
        data: payload,
      },
      options
    );
    let created = response.data;
    if (!created || (!created.id && !created._id)) {
      try {
        // Intentar fallback a /auth/register en algunos despliegues
        const res2 = await requestWithAuth(
          { method: "post", url: "/auth/register", data: payload },
          options
        );
        created = res2.data;
      } catch {}
      if (!created || (!created.id && !created._id)) {
        try {
          const list = await this.listUsuarios(options);
          const found = list.find(
            (u) => String(u.email || "").toLowerCase() === String(payload.email || "").toLowerCase()
          );
          if (found) created = found;
        } catch {}
      }
    }
    return created;
  },
  async deleteUsuario(id, options) {
    try {
      await requestWithAuth(
        {
          method: "delete",
          url: `/usuarios/${id}`,
        },
        options
      );
    } catch {
      // Limpieza mejor-esfuerzo
    }
  },
  async listUsuarios(options) {
    const response = await requestWithAuth(
      {
        method: "get",
        url: "/usuarios",
      },
      options
    );
    return Array.isArray(response.data) ? response.data : [];
  },
  async createEntrega(payload, options) {
    // Asegurar alumnoId cuando no se provee: algunos backends lo requieren
    let enriched = { ...payload };
    if (!enriched.alumnoId && !enriched.alumno?.id && !enriched.alumno?._id) {
      try {
        const users = await this.listUsuarios(options);
        const alumno = users.find(
          (u) => String(u.role || u.rol || u.tipo).toLowerCase() === "alumno"
        );
        const alumnoId = alumno?.id || alumno?._id;
        if (alumnoId) {
          enriched.alumnoId = alumnoId;
        }
      } catch {
        // continuar sin enriquecer si el listado falla
      }
    }

    const response = await requestWithAuth(
      {
        method: "post",
        url: "/entregas",
        data: enriched,
      },
      options
    );
    return response.data;
  },
  async updateEntrega(id, payload, options) {
    const response = await requestWithAuth(
      {
        method: "put",
        url: `/entregas/${id}`,
        data: payload,
      },
      options
    );
    return response.data;
  },
  async deleteEntrega(id, options) {
    try {
      await requestWithAuth(
        {
          method: "delete",
          url: `/entregas/${id}`,
        },
        options
      );
    } catch {
      // Ignorar errores de cleanup
    }
  },
  async listEntregas(options) {
    const response = await requestWithAuth(
      {
        method: "get",
        url: "/entregas",
      },
      options
    );
    return Array.isArray(response.data) ? response.data : [];
  },
};
