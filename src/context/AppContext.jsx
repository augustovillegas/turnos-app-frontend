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
  getSlots,
  solicitarSlot,
  cancelarSlot,
} from "../services/slotsService";
import {
  getEntregas,
  createEntrega as apiCreateEntrega,
  updateEntrega as apiUpdateEntrega,
  deleteEntrega as apiDeleteEntrega,
} from "../services/entregasService"; // Panel admin (profesor/superadmin)
import {
  getSubmissionsByUser,
  createSubmission,
  updateSubmission,
  deleteSubmission,
} from "../services/submissionsService"; // Flujo alumno
import {
  getUsuarios,
  approveUsuario as apiApproveUsuario,
  updateUsuarioEstado as apiUpdateUsuarioEstado,
  createUsuario as apiCreateUsuario,
  updateUsuario as apiUpdateUsuario,
  deleteUsuario as apiDeleteUsuario,
} from "../services/usuariosService";
import { showToast } from "../utils/feedback/toasts";
import { formatErrorMessage } from "../utils/feedback/errorExtractor"; // ⬅️ añadido
import { normalizeUsuario, normalizeUsuariosCollection } from "../utils/usuarios/normalizeUsuario";

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

import {
  normalizeTurno,
  normalizeTurnosCollection,
} from "../utils/turnos/normalizeTurno";
import {
  normalizeEntrega,
  normalizeEntregasCollection,
} from "../utils/entregas/normalizeEntrega";

const normalizeItem = (item, type = "generic") => {
  if (!item || typeof item !== "object") return item;
  if (type === "turno") return normalizeTurno(item);
  if (type === "entrega") return normalizeEntrega(item);
  const resolvedId =
    item.id ?? extractId(item._id) ?? extractId(item.id) ?? null;
  return {
    ...item,
    id: resolvedId ?? item.id ?? extractId(item._id) ?? item._id ?? null,
  };
};

const normalizeCollection = (collection, type = "generic") =>
  Array.isArray(collection) ? collection.map((item) => normalizeItem(item, type)) : [];

const AppContext = createContext();

// --- Provider principal: expone estado compartido y acciones ---

export const AppProvider = ({ children }) => {
  // --- Estado persistido en localStorage + banderas de carga/errores ---
  const [turnosState, setTurnosState] = useState([]);
  const [entregas, setEntregas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const { usuario, token } = useAuth();
  const { start, stop } = useLoading();
  const { pushError } = useError();

  const turnosRef = useRef(normalizeCollection(turnosState));
  const entregasRef = useRef(normalizeCollection(entregas));
  const usuariosRef = useRef(normalizeCollection(usuarios));

  const notifyError = useCallback(
    (message, error, title = "Error en la operación") => {
      // Usar extractor unificado según contrato backend {message, errores?}
      const detailedMessage = formatErrorMessage(error, message);

      if (pushError) {
        const description =
          error?.message && error.message !== detailedMessage
            ? error.message
            : "Inténtalo nuevamente en unos instantes.";
        pushError(detailedMessage, {
          title,
          description,
          autoDismiss: false,
        });
      }
      // ⬇️ toast global para mantener el mismo comportamiento que el toasty anterior
      showToast(detailedMessage, "error");
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

  useEffect(() => {
    entregasRef.current = normalizeCollection(entregas);
  }, [entregas]);

  useEffect(() => {
    usuariosRef.current = normalizeCollection(usuarios);
  }, [usuarios]);

  // No hay modo offline persistido: cada vista consulta el backend cuando lo necesita.

  // --- Operaciones remotas: turnos, entregas, usuarios ---
  const loadTurnos = useCallback(
    async (params = {}) => {
      if (!token) {
        turnosRef.current = [];
        setTurnos([]);
        return [];
      }
      start("turnos");
      try {
        // Si el usuario es alumno, debe consumir /slots en lugar de /turnos (panel admin)
        const esAlumno = usuario?.role === "alumno";
        const remoteTurnos = esAlumno ? await getSlots(params) : await getTurnos(params);
        const normalized = normalizeCollection(remoteTurnos, "turno");
        setTurnos(normalized);
        return normalized;
      } catch (error) {
        notifyError("No se pudieron cargar los turnos.", error, "Error al cargar turnos");
        return turnosRef.current;
      } finally {
        stop("turnos");
      }
    },
    [setTurnos, token, usuario, start, stop, notifyError]
  );

  const loadEntregas = useCallback(
    async (params = {}) => {
      if (!token) {
        setEntregas([]);
        entregasRef.current = [];
        return [];
      }
      start("entregas");
      try {
        const esAlumno = usuario?.role === "alumno";
        let data;
        if (esAlumno) {
          // Para alumno, listar propias entregas vía /submissions/:userId
          const userId = usuario?.id || usuario?._id;
          if (!userId) {
            console.warn("[AppContext] loadEntregas: No se pudo resolver userId para alumno.");
            data = [];
          } else {
            console.log("[AppContext] loadEntregas: Fetching submissions for userId:", userId);
            data = await getSubmissionsByUser(userId);
            console.log("[AppContext] loadEntregas: Raw submissions received:", data.length, "items");
          }
        } else {
          // Profesor / superadmin usan panel /entregas
            console.log("[AppContext] loadEntregas: Fetching all entregas (profesor/superadmin)");
            data = await getEntregas(params);
            console.log("[AppContext] loadEntregas: Raw entregas received:", data.length, "items");
            console.log("[AppContext] loadEntregas: First 2 raw items:", JSON.stringify(data.slice(0, 2), null, 2));
        }
        const normalized = normalizeCollection(data, "entrega");
        console.log("[AppContext] loadEntregas: Normalized count:", normalized.length);
        console.log("[AppContext] loadEntregas: First 2 normalized:", JSON.stringify(normalized.slice(0, 2), null, 2));
        setEntregas(normalized);
        return normalized;
      } catch (error) {
        console.error("[AppContext] loadEntregas failed:", error);
        notifyError("No se pudieron cargar las entregas.", error, "Error al cargar entregas");
        return entregasRef.current;
      } finally {
        stop("entregas");
      }
    },
    [token, usuario, setEntregas, start, stop, notifyError]
  );

  const loadUsuarios = useCallback(
    async (params = {}) => {
      if (!token) {
        setUsuarios([]);
        usuariosRef.current = [];
        return [];
      }
      if (usuario?.role !== "superadmin" && usuario?.role !== "profesor") {
        return usuariosRef.current;
      }
      start("usuarios");
      try {
        const data = await getUsuarios(params);
        const normalized = normalizeUsuariosCollection(data);
        setUsuarios(normalized);
        return normalized;
      } catch (error) {
        notifyError("No se pudieron cargar los usuarios.", error, "Error al cargar usuarios");
        return usuariosRef.current;
      } finally {
        stop("usuarios");
      }
    },
    [token, usuario, setUsuarios, start, stop, notifyError]
  );

  const createEntrega = useCallback(
    async (payload) => {
      start("entregas");
      try {
        const esAlumno = usuario?.role === "alumno";
        console.log("[AppContext] createEntrega: Payload recibido:", JSON.stringify(payload, null, 2));
        console.log("[AppContext] createEntrega: Usuario actual:", { 
          id: usuario?.id, 
          role: usuario?.role, 
          email: usuario?.email,
          moduleNumber: usuario?.moduleNumber,
          moduleLabel: usuario?.moduleLabel 
        });
        let created;
        if (esAlumno) {
          const slotId = payload.slotId || payload.turnoId || payload.slot || null;
          if (!slotId) throw new Error("Falta slotId para crear la entrega del alumno.");
          console.log("[AppContext] createEntrega: Creando vía createSubmission con slotId:", slotId);
          created = await createSubmission(slotId, payload);
        } else {
          console.log("[AppContext] createEntrega: Creando vía apiCreateEntrega (profesor/superadmin)");
          created = await apiCreateEntrega(payload);
        }
        console.log("[AppContext] createEntrega: Respuesta del backend:", JSON.stringify(created, null, 2));
        const normalized = normalizeItem(created, "entrega");
        console.log("[AppContext] createEntrega: Entrega normalizada:", JSON.stringify(normalized, null, 2));
        if (normalized) {
          setEntregas((prev) => {
            const base = normalizeCollection(prev);
            return [...base, normalized];
          });
        }
        showToast("Entrega creada correctamente", "success");
        return normalized;
      } catch (error) {
        console.error("Error al crear entrega", error);
        showToast("Error al crear la entrega", "error");
        throw error;
      } finally {
        stop("entregas");
      }
    },
    [setEntregas, usuario, start, stop]
  );

  const updateEntrega = useCallback(
    async (id, payload = {}) => {
      start("entregas");
      try {
        const currentList = entregasRef.current;
        const current = currentList.find((item) => String(item.id) === String(id));
        const requestPayload = current ? { ...current, ...payload } : payload;
        const esAlumno = usuario?.role === "alumno";
        const updated = esAlumno
          ? await updateSubmission(id, requestPayload)
          : await apiUpdateEntrega(id, requestPayload);
        const normalized = normalizeItem(updated, "entrega");
        const targetId = normalized?.id ?? id;
        const fallback = current && targetId != null
          ? { ...current, ...payload, id: targetId }
          : { ...payload, id: targetId };
        const nextEntrega = normalized ?? fallback;
        setEntregas((prev) => {
          const base = normalizeCollection(prev);
          if (!nextEntrega) return base;
          const exists = base.some((item) => String(item.id) === String(targetId));
          if (exists) {
            return base.map((item) => String(item.id) === String(targetId) ? { ...item, ...nextEntrega } : item);
          }
          return [...base, nextEntrega];
        });
        showToast("Entrega actualizada", "success");
        return nextEntrega;
      } catch (error) {
        console.error("[AppContext] Error al actualizar entrega:", error);
        showToast("Error al actualizar la entrega", "error");
        throw error;
      } finally {
        stop("entregas");
      }
    },
    [setEntregas, usuario, start, stop]
  );

  const removeEntrega = useCallback(
    async (id) => {
      start("entregas");
      try {
        const esAlumno = usuario?.role === "alumno";
        if (esAlumno) {
          await deleteSubmission(id);
        } else {
          await apiDeleteEntrega(id);
        }
        setEntregas((prev) =>
          normalizeCollection(prev).filter((entregaItem) => String(entregaItem.id) !== String(id))
        );
        showToast("Entrega eliminada", "success");
      } catch (error) {
        console.error("Error al eliminar entrega", error);
        showToast("Error al eliminar la entrega", "error");
        throw error;
      } finally {
        stop("entregas");
      }
    },
    [setEntregas, usuario, start, stop]
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
        const normalizado = normalizeUsuario(aprobado);
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
        showToast("Usuario aprobado", "success");
        return merged;
      } catch (error) {
        console.error("Error al aprobar usuario", error);
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
        const normalizado = normalizeUsuario(actualizado);
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
        showToast(
          `Estado de usuario actualizado${estado ? ` a "${estado}"` : ""}`,
          "success"
        );
        return merged;
      } catch (error) {
        console.error("Error al actualizar estado del usuario", error);
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
        showToast("Turno creado", "success");
        return normalized;
      } catch (error) {
        console.error("Error al crear turno", error);
        showToast("Error al crear el turno", "error");
        throw error;
      } finally {
        stop("turnos");
      }
    },
    [setTurnos, start, stop]
  );

  const updateTurno = useCallback(
    async (id, payload = {}) => {
      start("turnos");
      try {
        const currentList = turnosRef.current;
        const existente = currentList.find(
          (turno) => String(turno.id) === String(id)
        );
        const requestPayload = existente ? { ...existente, ...payload } : payload;
        const actualizado = await apiUpdateTurno(id, requestPayload);
        const normalized = normalizeItem(actualizado, "turno");
        const targetId = normalized?.id ?? id;
        const nextTurno = targetId != null
          ? {
              ...(existente || {}),
              ...requestPayload,
              ...normalized,
              id: targetId,
            }
          : null;

        if (!nextTurno) {
          throw new Error("No se pudo resolver el turno actualizado.");
        }

        setTurnos((prev) => {
          const base = Array.isArray(prev) ? prev : [];
          const exists = base.some((turno) => String(turno.id) === String(targetId));
          if (exists) {
            return base.map((turno) =>
              String(turno.id) === String(targetId) ? { ...turno, ...nextTurno } : turno
            );
          }
          return [...base, nextTurno];
        });
        showToast("Turno actualizado", "success");
        return nextTurno;
      } catch (error) {
        console.error("Error al actualizar turno", error);
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
        showToast("Turno eliminado", "success");
      } catch (error) {
        console.error("Error al eliminar turno", error);
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
        return normalized;
      } catch (error) {
        console.error("Error al obtener turno", error);
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
      turnosRef.current = [];
      setTurnos([]);
      setEntregas([]);
      setUsuarios([]);
    }
  }, [token, usuario, setTurnos, setEntregas, setUsuarios]);

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
        // --- Operaciones específicas alumno sobre /slots ---
        solicitarTurno: async (id) => {
          start("turnos");
          try {
            const actualizado = await solicitarSlot(id);
            const normalizado = normalizeItem(actualizado, "turno");
            const targetId = normalizado?.id ?? id;
            setTurnos((prev) => {
              const base = normalizeCollection(prev);
              const exists = base.some((t) => String(t.id) === String(targetId));
              if (exists) {
                return base.map((t) =>
                  String(t.id) === String(targetId)
                    ? { ...t, ...normalizado, estado: normalizado.estado || "Solicitado" }
                    : t
                );
              }
              return [...base, { ...normalizado, estado: normalizado.estado || "Solicitado" }];
            });
            showToast("Turno solicitado", "success");
            return normalizado;
          } catch (error) {
            console.error("Error al solicitar turno (slot)", error);
            showToast("Error al solicitar el turno", "error");
            throw error;
          } finally {
            stop("turnos");
          }
        },
        cancelarTurno: async (id) => {
          start("turnos");
          try {
            const actualizado = await cancelarSlot(id);
            const normalizado = normalizeItem(actualizado, "turno");
            const targetId = normalizado?.id ?? id;
            setTurnos((prev) => {
              const base = normalizeCollection(prev);
              const exists = base.some((t) => String(t.id) === String(targetId));
              if (exists) {
                return base.map((t) =>
                  String(t.id) === String(targetId)
                    ? { ...t, ...normalizado, estado: normalizado.estado || "Disponible" }
                    : t
                );
              }
              return [...base, { ...normalizado, estado: normalizado.estado || "Disponible" }];
            });
            showToast("Solicitud cancelada", "info");
            return normalizado;
          } catch (error) {
            console.error("Error al cancelar turno (slot)", error);
            showToast("Error al cancelar el turno", "error");
            throw error;
          } finally {
            stop("turnos");
          }
        },
        // === Operaciones remotas (API) ===
        createUsuarioRemoto: async (payload = {}) => {
          start("usuarios-create");
          try {
            const creado = await apiCreateUsuario(payload);
            const normalizado = normalizeUsuario(creado);
            setUsuarios((prev) => {
              const base = normalizeUsuariosCollection(prev);
              return [...base, normalizado];
            });
            showToast("Usuario creado en servidor", "success");
            // Reconciliar para obtener datos finales
            await loadUsuarios();
            return normalizado;
          } catch (error) {
            console.error("Error al crear usuario remoto", error);
            notifyError("No se pudo crear el usuario.", error, "Error creación usuario");
            throw error;
          } finally {
            stop("usuarios-create");
          }
        },
        updateUsuarioRemoto: async (id, payload = {}) => {
          start("usuarios-update");
          try {
            const actualizado = await apiUpdateUsuario(id, payload);
            const normalizado = normalizeUsuario(actualizado);
            setUsuarios((prev) => {
              const base = normalizeUsuariosCollection(prev);
              return base.map((usuario) =>
                String(usuario.id) === String(normalizado.id)
                  ? normalizado
                  : usuario
              );
            });
            showToast("Usuario actualizado", "success");
            await loadUsuarios();
            return normalizado;
          } catch (error) {
            console.error("Error al actualizar usuario remoto", error);
            notifyError("No se pudo actualizar el usuario.", error, "Error actualización usuario");
            throw error;
          } finally {
            stop("usuarios-update");
          }
        },
        deleteUsuarioRemoto: async (id) => {
          start("usuarios-delete");
          try {
            await apiDeleteUsuario(id);
            setUsuarios((prev) => {
              const base = normalizeUsuariosCollection(prev);
              return base.filter((u) => String(u.id) !== String(id));
            });
            showToast("Usuario eliminado en servidor", "success");
            await loadUsuarios();
          } catch (error) {
            console.error("Error al eliminar usuario remoto", error);
            notifyError("No se pudo eliminar el usuario.", error, "Error eliminación usuario");
            throw error;
          } finally {
            stop("usuarios-delete");
          }
        },
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => useContext(AppContext);
