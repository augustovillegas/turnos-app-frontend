/* eslint-disable react-refresh/only-export-components */
// === App Data Context ===
// Centraliza la cache local de turnos, entregas y usuarios junto a operaciones CRUD.
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useCallback,
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

const AppContext = createContext();

// --- Provider principal: expone estado compartido y acciones ---

export const AppProvider = ({ children }) => {
  // --- Estado persistido en localStorage + banderas de carga/errores ---
  const [turnosState, setTurnosState] = useLocalStorage("turnos", []);
  const [entregas, setEntregas] = useLocalStorage("entregas", []);
  const [usuarios, setUsuarios] = useLocalStorage("usuarios", []);
  const [turnosLoading, setTurnosLoading] = useState(false);
  const [turnosError, setTurnosError] = useState(null);
  const [entregasError, setEntregasError] = useState(null);
  const [usuariosError, setUsuariosError] = useState(null);
  const { user, token } = useAuth();
  const { start, stop } = useLoading();
  const { pushError } = useError();

  const notifyError = useCallback(
    (message, error, title = "Error en la operación") => {
      if (!pushError) return;
      const description =
        error?.message && error.message !== message
          ? error.message
          : "Intentalo nuevamente en unos instantes.";
      pushError(message, {
        title,
        description,
        autoDismiss: false,
      });
    },
    [pushError]
  );

  // --- Setter seguro para mantener los turnos normalizados ---
  const setTurnos = useCallback(
    (next) =>
      setTurnosState((prev) => {
        const previous = normalizeCollection(prev);
        const resolved = typeof next === "function" ? next(previous) : next;
        return normalizeCollection(resolved);
      }),
    [setTurnosState]
  );

  // --- Sincroniza cambios de almacenamiento entre pestañas ---
  // --- Limpia caches cuando la sesión expira ---
  useEffect(() => {
    const handleStorageChange = (event) => {
      try {
        if (event.key === "turnos") {
          const value = event.newValue ? JSON.parse(event.newValue) : [];
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
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setTurnos, setEntregas, setUsuarios]);

  // --- Operaciones remotas: turnos, entregas, usuarios ---
  const loadTurnos = useCallback(
    async (params = {}) => {
      if (!token) {
        setTurnos([]);
        setTurnosError(null);
        return [];
      }
      setTurnosLoading(true);
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
        return normalizeCollection(turnosState);
      } finally {
        setTurnosLoading(false);
        stop("turnos");
      }
    },
    [setTurnos, token, start, stop, turnosState, notifyError]
  );

  const loadEntregas = useCallback(
    async (params = {}) => {
      if (!token) {
        setEntregas([]);
        setEntregasError(null);
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
        return Array.isArray(entregas) ? entregas : [];
      } finally {
        stop("entregas");
      }
    },
    [token, setEntregas, start, stop, entregas, notifyError]
  );

const loadUsuarios = useCallback(
  async (params = {}) => {
    if (!token) {
      setUsuarios([]);
      setUsuariosError(null);
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
        return Array.isArray(usuarios) ? usuarios : [];
      } finally {
        stop("usuarios");
      }
    },
    [token, setUsuarios, start, stop, usuarios, notifyError]
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
        return normalized;
      } catch (error) {
        console.error("Error al crear entrega", error);
        setEntregasError(error.message);
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
        const currentList = normalizeCollection(entregas);
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
        return nextEntrega;
      } catch (error) {
        console.error("Error al actualizar entrega", error);
        setEntregasError(error.message);
        throw error;
      } finally {
        stop("entregas");
      }
    },
    [entregas, setEntregas, start, stop]
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
      } catch (error) {
        console.error("Error al eliminar entrega", error);
        setEntregasError(error.message);
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
        const listado = normalizeCollection(usuarios);
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
        return merged;
      } catch (error) {
        console.error("Error al aprobar usuario", error);
        setUsuariosError(error.message);
        throw error;
      } finally {
        stop("usuarios");
      }
    },
    [usuarios, setUsuarios, start, stop]
  );

  const updateUsuarioEstadoRemoto = useCallback(
    async (id, estado) => {
      start("usuarios");
      try {
        const listado = normalizeCollection(usuarios);
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
        return merged;
      } catch (error) {
        console.error("Error al actualizar estado del usuario", error);
        setUsuariosError(error.message);
        throw error;
      } finally {
        stop("usuarios");
      }
    },
    [usuarios, setUsuarios, start, stop]
  );

  // --- CRUD de turnos disponible para dashboards ---
  const createTurno = useCallback(
    async (payload) => {
      setTurnosLoading(true);
      start("turnos");
      try {
        const nuevo = await apiCreateTurno(payload);
        const normalized = normalizeItem(nuevo);
        setTurnos((prev) => {
          const base = Array.isArray(prev) ? prev : [];
          return [...base, normalized];
        });
        setTurnosError(null);
        return normalized;
      } catch (error) {
        console.error("Error al crear turno", error);
        setTurnosError(error.message);
        throw error;
      } finally {
        setTurnosLoading(false);
        stop("turnos");
      }
    },
    [setTurnos, start, stop]
  );

  const updateTurno = useCallback(
    async (id, payload) => {
      setTurnosLoading(true);
      start("turnos");
      try {
        const actualizado = await apiUpdateTurno(id, payload);
        const normalized = normalizeItem(actualizado);
        const targetId = normalized.id ?? id;
        setTurnos((prev) =>
          Array.isArray(prev)
            ? prev.map((turno) =>
                String(turno.id) === String(targetId) ? normalized : turno
              )
            : [normalized]
        );
        setTurnosError(null);
        return normalized;
      } catch (error) {
        console.error("Error al actualizar turno", error);
        setTurnosError(error.message);
        throw error;
      } finally {
        setTurnosLoading(false);
        stop("turnos");
      }
    },
    [setTurnos, start, stop]
  );

  const removeTurno = useCallback(
    async (id) => {
      setTurnosLoading(true);
      start("turnos");
      try {
        await apiDeleteTurno(id);
        setTurnos((prev) =>
          Array.isArray(prev)
            ? prev.filter((turno) => String(turno.id) !== String(id))
            : []
        );
        setTurnosError(null);
      } catch (error) {
        console.error("Error al eliminar turno", error);
        setTurnosError(error.message);
        throw error;
      } finally {
        setTurnosLoading(false);
        stop("turnos");
      }
    },
    [setTurnos, start, stop]
  );

  const findTurnoById = useCallback(
    async (id) => {
      const cached = turnosState.find(
        (turno) => String(turno.id) === String(id)
      );
      if (cached) return cached;

      setTurnosLoading(true);
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
        throw error;
      } finally {
        setTurnosLoading(false);
        stop("turnos");
      }
    },
    [turnosState, setTurnos, start, stop]
  );

  useEffect(() => {
    if (!token || !user) {
      setTurnos([]);
      setEntregas([]);
      setUsuarios([]);
      setTurnosError(null);
      setEntregasError(null);
      setUsuariosError(null);
    }
  }, [
    token,
    user,
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
