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
import {
  getTurnos,
  getTurnoById as apiGetTurnoById,
  createTurno as apiCreateTurno,
  updateTurno as apiUpdateTurno,
  deleteTurno as apiDeleteTurno,
} from "../services/turnosService";
import { getEntregas } from "../services/entregasService";
import { getUsuarios } from "../services/usuariosService";

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
        return normalizeCollection(turnosState);
      } finally {
        setTurnosLoading(false);
        stop("turnos");
      }
    },
    [setTurnos, token, start, stop, turnosState]
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
        return Array.isArray(entregas) ? entregas : [];
      } finally {
        stop("entregas");
      }
    },
    [token, setEntregas, start, stop, entregas]
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
        return Array.isArray(usuarios) ? usuarios : [];
      } finally {
        stop("usuarios");
      }
    },
    [token, setUsuarios, start, stop, usuarios]
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
        setEntregas,
        usuarios,
        setUsuarios,
        totalTurnosSolicitados,
        totalEntregas,
        totalUsuarios,
        loadTurnos,
        loadEntregas,
        loadUsuarios,
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
