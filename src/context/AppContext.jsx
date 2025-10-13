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
  const { user, token } = useAuth();

  // --- Setter seguro para mantener los turnos normalizados ---
  const setTurnos = useCallback(
    (next) =>
      setTurnosState((prev) => {
        const previous = normalizeCollection(prev);
        const resolved =
          typeof next === "function" ? next(previous) : next;
        return normalizeCollection(resolved);
      }),
    [setTurnosState]
  );

  // --- Sincroniza cambios de almacenamiento entre pestañas ---
  // --- Limpia caches cuando la sesión expira ---
  useEffect(() => {
    const handleStorageChange = (event) => {
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
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [setTurnos, setEntregas, setUsuarios]);

  // --- Operaciones remotas: turnos, entregas, usuarios ---
  const loadTurnos = useCallback(
    async (params = {}) => {
      if (!token) {
        setTurnos([]);
        return [];
      }
      setTurnosLoading(true);
      try {
        const remoteTurnos = await getTurnos(params);
        const normalized = normalizeCollection(remoteTurnos);
        setTurnos(normalized);
        setTurnosError(null);
        return normalized;
      } catch (error) {
        console.error("Error al cargar turnos", error);
        setTurnosError(error.message);
        setTurnos([]);
        return [];
      } finally {
        setTurnosLoading(false);
      }
    },
    [setTurnos, token]
  );

  const loadEntregas = useCallback(
    async (params = {}) => {
      if (!token) {
        setEntregas([]);
        return [];
      }
      try {
        const data = await getEntregas(params);
        const normalized = normalizeCollection(data);
        setEntregas(normalized);
        return normalized;
      } catch (error) {
        console.error("Error al cargar entregas", error);
        setEntregas([]);
        return [];
      }
    },
    [token, setEntregas]
  );

  const loadUsuarios = useCallback(
    async (params = {}) => {
      if (!token) {
        setUsuarios([]);
        return [];
      }
      try {
        const data = await getUsuarios(params);
        const normalized = normalizeCollection(data);
        setUsuarios(normalized);
        return normalized;
      } catch (error) {
        console.error("Error al cargar usuarios", error);
        setUsuarios([]);
        return [];
      }
    },
    [token, setUsuarios]
  );

  // --- CRUD de turnos disponible para dashboards ---
  const createTurno = useCallback(
    async (payload) => {
      setTurnosLoading(true);
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
      }
    },
    [setTurnos]
  );

  const updateTurno = useCallback(
    async (id, payload) => {
      setTurnosLoading(true);
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
      }
    },
    [setTurnos]
  );

  const removeTurno = useCallback(
    async (id) => {
      setTurnosLoading(true);
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
      }
    },
    [setTurnos]
  );

  const findTurnoById = useCallback(
    async (id) => {
      const cached = turnosState.find(
        (turno) => String(turno.id) === String(id)
      );
      if (cached) return cached;

      setTurnosLoading(true);
      try {
        const remote = await apiGetTurnoById(id);
        const normalized = normalizeItem(remote);
        if (normalized) {
          const targetId = normalized.id ?? id;
          setTurnos((prev) => {
            if (
              Array.isArray(prev) &&
              prev.some(
                (turno) => String(turno.id) === String(targetId)
              )
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
      }
    },
    [turnosState, setTurnos]
  );

  useEffect(() => {
    if (!token || !user) {
      setTurnos([]);
      setEntregas([]);
      setUsuarios([]);
    }
  }, [token, user, setTurnos, setEntregas, setUsuarios]);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => useContext(AppContext);
