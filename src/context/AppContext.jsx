// === App Data Context ===
// Centraliza la cache local de turnos, entregas y usuarios junto a operaciones CRUD.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
  useState,
} from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "./AuthContext";
import { useLoading } from "./LoadingContext";
import { useError } from "./ErrorContext";
import {
  getTurnos,
  getTurnoById as apiGetTurnoById,
  createTurno as apiCreateTurno,
  updateTurno as apiUpdateTurno,
  deleteTurno as apiDeleteTurno,
} from "../services/turnosService";
import {
  getEntregas,
  createEntrega as apiCreateEntrega,
  updateEntrega as apiUpdateEntrega,
  deleteEntrega as apiDeleteEntrega,
} from "../services/entregasService";
import {
  getUsuarios,
  approveUsuario as apiApproveUsuario,
  updateUsuarioEstado as apiUpdateUsuarioEstado,
} from "../services/usuariosService";
import { showToast } from "../utils/feedback/toasts"; // ⬅️ añadido

// --- Utilidades internas para normalizar ids y colecciones ---

const extractId = (value) => {
  if (value == null) return null;
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  if (typeof value === "object") {
    if (typeof value.$oid === "string") {
      return value.$oid;
    }
  }
  return null;
};

const normalizeItem = (item) => {
  if (!item || typeof item !== "object") return item;
  const resolvedId =
    item.id ?? extractId(item._id) ?? extractId(item.id) ?? null;
  return {
    ...item,
    id: resolvedId ?? item.id ?? extractId(item._id) ?? item._id ?? null,
  };
};

const normalizeCollection = (collection) =>
  Array.isArray(collection) ? collection.map(normalizeItem) : [];

const TURNOS_STORAGE_KEY = "App-turnos";

const DEFAULT_TURNOS_SEED = normalizeCollection([
  {
    id: "seed-turno-1",
    review: 1,
    fecha: "2025-10-25",
    horario: "09:00 - 09:30",
    sala: "Sala Remota 1",
    zoomLink: "https://zoom.us/j/111111111",
    estado: "Disponible",
    start: "2025-10-25T12:00:00.000Z",
    end: "2025-10-25T12:30:00.000Z",
    comentarios: "Turno de muestra para onboarding.",
  },
  {
    id: "seed-turno-2",
    review: 2,
    fecha: "2025-10-26",
    horario: "10:00 - 10:45",
    sala: "Sala Remota 2",
    zoomLink: "https://zoom.us/j/222222222",
    estado: "Disponible",
    start: "2025-10-26T13:00:00.000Z",
    end: "2025-10-26T13:45:00.000Z",
    comentarios: "Revisión funcional con el equipo profesor.",
  },
  {
    id: "seed-turno-3",
    review: 3,
    fecha: "2025-10-27",
    horario: "11:30 - 12:00",
    sala: "Cowork Presencial 1",
    zoomLink: "https://zoom.us/j/333333333",
    estado: "Disponible",
    start: "2025-10-27T14:30:00.000Z",
    end: "2025-10-27T15:00:00.000Z",
    comentarios: "Espacio presencial para consultas de integración.",
  },
]);

const AppContext = createContext();

// --- Provider principal: expone estado compartido y acciones ---

export const AppProvider = ({ children }) => {
  // --- Estado persistido en localStorage + banderas de carga/errores ---
  const [turnosState, setTurnosState] = useLocalStorage(
    TURNOS_STORAGE_KEY,
    DEFAULT_TURNOS_SEED
  );
  const [entregas, setEntregas] = useLocalStorage("entregas", []);
  const [usuarios, setUsuarios] = useLocalStorage("usuarios", []);
  const [turnosError, setTurnosError] = useState(null);
  const [entregasError, setEntregasError] = useState(null);
  const [usuariosError, setUsuariosError] = useState(null);
  const { usuario, token } = useAuth();
  const { start, stop, isLoading } = useLoading();
  const { pushError } = useError();

  const turnosRef = useRef(normalizeCollection(turnosState));
  const entregasRef = useRef(normalizeCollection(entregas));
  const usuariosRef = useRef(normalizeCollection(usuarios));

  const notifyError = useCallback(
    (message, error, title = "Error en la operación") => {
      if (pushError) {
        const description =
          error?.message && error.message !== message
            ? error.message
            : "Inténtalo nuevamente en unos instantes.";
        pushError(message, {
          title,
          description,
          autoDismiss: false,
        });
      }
      // ⬇️ toast global para mantener el mismo comportamiento que el toasty anterior
      showToast(message, "error");
    },
    [pushError]
  );

  // --- Setter seguro para mantener los turnos normalizados ---
  const setTurnos = useCallback(
    (next) =>
      setTurnosState((prev) => {
        const previous = normalizeCollection(prev);
        const resolved = typeof next === "function" ? next(previous) : next;
        const normalized = normalizeCollection(resolved);
        turnosRef.current = normalized;
        return normalized;
      }),
    [setTurnosState]
  );

  useEffect(() => {
    turnosRef.current = normalizeCollection(turnosState);
  }, [turnosState]);

  const seededTurnosRef = useRef(false);

  useEffect(() => {
    if (seededTurnosRef.current) return;
    if (typeof window === "undefined") return;
    seededTurnosRef.current = true;

    try {
      const storage = window.localStorage;
      const legacyRaw = storage.getItem("turnos");

      if (legacyRaw && !storage.getItem(TURNOS_STORAGE_KEY)) {
        storage.setItem(TURNOS_STORAGE_KEY, legacyRaw);
        const legacyParsed = JSON.parse(legacyRaw);
        if (Array.isArray(legacyParsed) && legacyParsed.length > 0) {
          setTurnos(legacyParsed);
          return;
        }
      }

      const currentRaw = storage.getItem(TURNOS_STORAGE_KEY);
      if (!currentRaw || currentRaw === "[]") {
        storage.setItem(
          TURNOS_STORAGE_KEY,
          JSON.stringify(DEFAULT_TURNOS_SEED)
        );
        setTurnos(DEFAULT_TURNOS_SEED);
      }
    } catch (error) {
      console.error("No se pudo inicializar la coleccion App-turnos", error);
      setTurnos(DEFAULT_TURNOS_SEED);
      notifyError("No se pudo inicializar la colección de turnos.", error, "Error de inicialización");
    }
  }, [setTurnos, notifyError]);

  useEffect(() => {
    entregasRef.current = normalizeCollection(entregas);
  }, [entregas]);

  useEffect(() => {
    usuariosRef.current = normalizeCollection(usuarios);
  }, [usuarios]);

  // --- Sincroniza cambios de almacenamiento entre pestañas ---
  // --- Limpia caches cuando la sesión expira ---
  useEffect(() => {
    const handleStorageChange = (event) => {
      try {
        if (event.key === TURNOS_STORAGE_KEY || event.key === "turnos") {
          const rawValue = event.newValue;
          const value = rawValue ? JSON.parse(rawValue) : [];

          if (
            event.key === "turnos" &&
            typeof window !== "undefined" &&
            window.localStorage
          ) {
            window.localStorage.setItem(
              TURNOS_STORAGE_KEY,
              rawValue || "[]"
            );
          }

          setTurnos(value);
        }
        if (event.key === "entregas") {
          const value = event.newValue ? JSON.parse(event.newValue) : [];
          setEntregas(Array.isArray(value) ? value : []);
        }
        if (event.key === "usuarios") {
          const value = event.newValue ? JSON.parse(event.newValue) : [];
          setUsuarios(Array.isArray(value) ? value : []);
        }
      } catch (error) {
        console.error("No se pudo sincronizar datos desde storage", error);
        notifyError("No se pudo sincronizar datos desde storage.", error, "Error de sincronización");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setTurnos, setEntregas, setUsuarios, notifyError]);

  // --- Operaciones remotas: turnos, entregas, usuarios ---
  const loadTurnos = useCallback(
    async (params = {}) => {
      if (!token) {
        const fallback = normalizeCollection(DEFAULT_TURNOS_SEED);
        turnosRef.current = fallback;
        setTurnos(fallback);
        setTurnosError(null);
        return fallback;
      }
      start("turnos");
      try {
        const remoteTurnos = await getTurnos(params);
        const normalized = normalizeCollection(remoteTurnos);
        setTurnos(normalized);
        setTurnosError(null);
        return normalized;
      } catch (error) {
        console.error("Error al cargar turnos", error);
        setTurnosError(error.message);
        notifyError("No se pudieron cargar los turnos.", error, "Error al cargar turnos");
        return turnosRef.current;
      } finally {
        stop("turnos");
      }
    },
    [setTurnos, token, start, stop, notifyError]
  );

  const loadEntregas = useCallback(
    async (params = {}) => {
      if (!token) {
        setEntregas([]);
        setEntregasError(null);
        entregasRef.current = [];
        return [];
      }
      start("entregas");
      try {
        const data = await getEntregas(params);
        const normalized = normalizeCollection(data);
        setEntregas(normalized);
        setEntregasError(null);
        return normalized;
      } catch (error) {
        console.error("Error al cargar entregas", error);
        setEntregasError(error.message);
        notifyError("No se pudieron cargar las entregas.", error, "Error al cargar entregas");
        return entregasRef.current;
      } finally {
        stop("entregas");
      }
    },
    [token, setEntregas, start, stop, notifyError]
  );

  const loadUsuarios = useCallback(
    async (params = {}) => {
      if (!token) {
        setUsuarios([]);
        setUsuariosError(null);
        usuariosRef.current = [];
        return [];
      }
      start("usuarios");
      try {
        const data = await getUsuarios(params);
        const normalized = normalizeCollection(data);
        setUsuarios(normalized);
        setUsuariosError(null);
        return normalized;
      } catch (error) {
        console.error("Error al cargar usuarios", error);
        setUsuariosError(error.message);
        notifyError("No se pudieron cargar los usuarios.", error, "Error al cargar usuarios");
        return usuariosRef.current;
      } finally {
        stop("usuarios");
      }
    },
    [token, setUsuarios, start, stop, notifyError]
  );

  const createEntrega = useCallback(
    async (payload) => {
      start("entregas");
      try {
        const created = await apiCreateEntrega(payload);
        const normalized = normalizeItem(created);
        if (normalized) {
          setEntregas((prev) => {
            const base = normalizeCollection(prev);
            return [...base, normalized];
          });
        }
        setEntregasError(null);
        showToast("Entrega creada correctamente", "success");
        return normalized;
      } catch (error) {
        console.error("Error al crear entrega", error);
        setEntregasError(error.message);
        showToast("Error al crear la entrega", "error");
        throw error;
      } finally {
        stop("entregas");
      }
    },
    [setEntregas, start, stop]
  );

  const updateEntrega = useCallback(
    async (id, payload = {}) => {
      start("entregas");
      try {
        const currentList = entregasRef.current;
        const current = currentList.find(
          (item) => String(item.id) === String(id)
        );
        const requestPayload = current ? { ...current, ...payload } : payload;
        const updated = await apiUpdateEntrega(id, requestPayload);
        const normalized = normalizeItem(updated);
        const targetId = normalized?.id ?? id;
        const fallback =
          current && targetId != null
            ? { ...current, ...payload, id: targetId }
            : { ...payload, id: targetId };
        const nextEntrega = normalized ?? fallback;

        setEntregas((prev) => {
          const base = normalizeCollection(prev);
          if (!nextEntrega) return base;
          const exists = base.some(
            (item) => String(item.id) === String(targetId)
          );
          if (exists) {
            return base.map((item) =>
              String(item.id) === String(targetId)
                ? { ...item, ...nextEntrega }
                : item
            );
          }
          return [...base, nextEntrega];
        });
        setEntregasError(null);
        showToast("Entrega actualizada", "success");
        return nextEntrega;
      } catch (error) {
        console.error("Error al actualizar entrega", error);
        setEntregasError(error.message);
        showToast("Error al actualizar la entrega", "error");
        throw error;
      } finally {
        stop("entregas");
      }
    },
    [setEntregas, start, stop]
  );

  const removeEntrega = useCallback(
    async (id) => {
      start("entregas");
      try {
        await apiDeleteEntrega(id);
        setEntregas((prev) =>
          normalizeCollection(prev).filter(
            (entregaItem) => String(entregaItem.id) !== String(id)
          )
        );
        setEntregasError(null);
        showToast("Entrega eliminada", "success");
      } catch (error) {
        console.error("Error al eliminar entrega", error);
        setEntregasError(error.message);
        showToast("Error al eliminar la entrega", "error");
        throw error;
      } finally {
        stop("entregas");
      }
    },
    [setEntregas, start, stop]
  );

  const approveUsuarioRemoto = useCallback(
    async (id) => {
      start("usuarios");
      try {
        const listado = usuariosRef.current;
        const existente = listado.find(
          (usuario) => String(usuario.id) === String(id)
        );
        const aprobado = await apiApproveUsuario(id);
        const normalizado = normalizeItem(aprobado);
        const targetId = normalizado?.id ?? id;

        const merged = {
          ...existente,
          ...normalizado,
          id: targetId,
          estado:
            normalizado?.estado ??
            normalizado?.status ??
            "Aprobado",
          status:
            normalizado?.status ??
            normalizado?.estado ??
            "Aprobado",
          isApproved:
            normalizado?.isApproved ?? existente?.isApproved ?? true,
        };

        setUsuarios((prev) => {
          const base = normalizeCollection(prev);
          const exists = base.some(
            (usuario) => String(usuario.id) === String(targetId)
          );
          if (exists) {
            return base.map((usuario) =>
              String(usuario.id) === String(targetId) ? merged : usuario
            );
          }
          return [...base, merged];
        });

        setUsuariosError(null);
        showToast("Usuario aprobado", "success");
        return merged;
      } catch (error) {
        console.error("Error al aprobar usuario", error);
        setUsuariosError(error.message);
        showToast("Error al aprobar usuario", "error");
        throw error;
      } finally {
        stop("usuarios");
      }
    },
    [setUsuarios, start, stop]
  );

  const updateUsuarioEstadoRemoto = useCallback(
    async (id, estado) => {
      start("usuarios");
      try {
        const listado = usuariosRef.current;
        const existente = listado.find(
          (usuario) => String(usuario.id) === String(id)
        );
        const actualizado = await apiUpdateUsuarioEstado(id, estado);
        const normalizado = normalizeItem(actualizado);
        const targetId = normalizado?.id ?? id;

        const merged = {
          ...existente,
          ...normalizado,
          id: targetId,
          estado:
            estado ??
            normalizado?.estado ??
            normalizado?.status ??
            existente?.estado ??
            existente?.status ??
            null,
          status:
            estado ??
            normalizado?.status ??
            normalizado?.estado ??
            existente?.status ??
            existente?.estado ??
            null,
          isApproved:
            estado === "Aprobado"
              ? true
              : estado === "Rechazado"
              ? false
              : normalizado?.isApproved ?? existente?.isApproved ?? false,
        };

        setUsuarios((prev) => {
          const base = normalizeCollection(prev);
          const exists = base.some(
            (usuario) => String(usuario.id) === String(targetId)
          );
          if (exists) {
            return base.map((usuario) =>
              String(usuario.id) === String(targetId) ? merged : usuario
            );
          }
          return [...base, merged];
        });

        setUsuariosError(null);
        showToast(
          `Estado de usuario actualizado${estado ? ` a "${estado}"` : ""}`,
          "success"
        );
        return merged;
      } catch (error) {
        console.error("Error al actualizar estado del usuario", error);
        setUsuariosError(error.message);
        showToast("Error al actualizar estado del usuario", "error");
        throw error;
      } finally {
        stop("usuarios");
      }
    },
    [setUsuarios, start, stop]
  );

  // --- CRUD de turnos disponible para dashboards ---
  const createTurno = useCallback(
    async (payload) => {
      start("turnos");
      try {
        const nuevo = await apiCreateTurno(payload);
        const normalized = normalizeItem(nuevo);
        if (!normalized) {
          throw new Error("Respuesta inválida al crear turno.");
        }
        setTurnos((prev) => {
          const base = Array.isArray(prev) ? prev : [];
          return [...base, normalized];
        });
        setTurnosError(null);
        showToast("Turno creado", "success");
        return normalized;
      } catch (error) {
        console.error("Error al crear turno", error);
        setTurnosError(error.message);
        showToast("Error al crear el turno", "error");
        throw error;
      } finally {
        stop("turnos");
      }
    },
    [setTurnos, start, stop]
  );

  const updateTurno = useCallback(
    async (id, payload) => {
      start("turnos");
      try {
        const actualizado = await apiUpdateTurno(id, payload);
        const normalized = normalizeItem(actualizado);
        const targetId = normalized?.id ?? id;
        const nextTurno =
          normalized ??
          (targetId != null ? { ...payload, id: targetId } : null);
        if (!nextTurno || targetId == null) {
          throw new Error("No se pudo resolver el turno actualizado.");
        }
        setTurnos((prev) =>
          Array.isArray(prev)
            ? prev.map((turno) =>
                String(turno.id) === String(targetId) ? nextTurno : turno
              )
            : [nextTurno]
        );
        setTurnosError(null);
        showToast("Turno actualizado", "success");
        return nextTurno;
      } catch (error) {
        console.error("Error al actualizar turno", error);
        setTurnosError(error.message);
        showToast("Error al actualizar el turno", "error");
        throw error;
      } finally {
        stop("turnos");
      }
    },
    [setTurnos, start, stop]
  );

  const removeTurno = useCallback(
    async (id) => {
      start("turnos");
      try {
        await apiDeleteTurno(id);
        setTurnos((prev) =>
          Array.isArray(prev)
            ? prev.filter((turno) => String(turno.id) !== String(id))
            : []
        );
        setTurnosError(null);
        showToast("Turno eliminado", "success");
      } catch (error) {
        console.error("Error al eliminar turno", error);
        setTurnosError(error.message);
        showToast("Error al eliminar el turno", "error");
        throw error;
      } finally {
        stop("turnos");
      }
    },
    [setTurnos, start, stop]
  );

  const findTurnoById = useCallback(
    async (id) => {
      const cached = turnosRef.current.find(
        (turno) => String(turno.id) === String(id)
      );
      if (cached) return cached;

      start("turnos");
      try {
        const remote = await apiGetTurnoById(id);
        const normalized = normalizeItem(remote);
        if (normalized) {
          const targetId = normalized.id ?? id;
          setTurnos((prev) => {
            if (
              Array.isArray(prev) &&
              prev.some((turno) => String(turno.id) === String(targetId))
            ) {
              return prev.map((turno) =>
                String(turno.id) === String(targetId) ? normalized : turno
              );
            }
            const base = Array.isArray(prev) ? prev : [];
            return [...base, normalized];
          });
        }
        setTurnosError(null);
        return normalized;
      } catch (error) {
        console.error("Error al obtener turno", error);
        setTurnosError(error.message);
        notifyError("No se pudo obtener el turno solicitado.", error, "Error al obtener turno");
        throw error;
      } finally {
        stop("turnos");
      }
    },
    [setTurnos, start, stop, notifyError]
  );

  useEffect(() => {
    if (!token || !usuario) {
      const fallback = normalizeCollection(DEFAULT_TURNOS_SEED);
      turnosRef.current = fallback;
      setTurnos(fallback);
      setEntregas([]);
      setUsuarios([]);
      setTurnosError(null);
      setEntregasError(null);
      setUsuariosError(null);
    }
  }, [
    token,
    usuario,
    setTurnos,
    setEntregas,
    setUsuarios,
    setTurnosError,
    setEntregasError,
    setUsuariosError,
  ]);

  // --- Métricas agregadas para paneles y badges ---
  const { totalTurnosSolicitados, totalEntregas, totalUsuarios } = useMemo(
    () => ({
      totalTurnosSolicitados: turnosState.filter(
        (turno) => turno.estado === "Solicitado"
      ).length,
      totalEntregas: entregas.length,
      totalUsuarios: usuarios.length,
    }),
    [turnosState, entregas, usuarios]
  );

  const turnosLoading = isLoading("turnos");

  return (
    <AppContext.Provider
      value={{
        turnos: turnosState,
        setTurnos,
        entregas,
        usuarios,
        totalTurnosSolicitados,
        totalEntregas,
        totalUsuarios,
        loadTurnos,
        loadEntregas,
        loadUsuarios,
        createEntrega,
        updateEntrega,
        removeEntrega,
        approveUsuario: approveUsuarioRemoto,
        updateUsuarioEstado: updateUsuarioEstadoRemoto,
        createTurno,
        updateTurno,
        removeTurno,
        findTurnoById,
        turnosLoading,
        turnosError,
        entregasError,
        usuariosError,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => useContext(AppContext);
