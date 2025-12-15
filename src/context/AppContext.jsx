// === App Data Context ===
// Centraliza la cache local de turnos, entregas y usuarios junto a operaciones CRUD.
/* eslint-disable react-refresh/only-export-components */
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
  actualizarEstadoSlot,
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
} from "../utils/turnos/normalizeTurno";
import {
  normalizeEntrega,
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
        const parseDateSafe = (value) => {
          if (!value) return 0;
          const direct = new Date(value);
          if (!Number.isNaN(direct.getTime())) return direct.getTime();
          if (typeof value === "string" && value.includes("/")) {
            const [dd, mm, yyyy] = value.split("/").map(Number);
            if (dd && mm && yyyy) {
              return new Date(yyyy, mm - 1, dd).getTime();
            }
          }
          return 0;
        };
        // Si el usuario es alumno, debe consumir /slots en lugar de /turnos (panel admin)
        const esAlumno = usuario?.role === "alumno";
        const remoteTurnos = esAlumno ? await getSlots(params) : await getTurnos(params);
        const normalized = normalizeCollection(remoteTurnos, "turno").sort(
          (a, b) =>
            parseDateSafe(b.start ?? b.fecha ?? b.date ?? b.dateISO) -
            parseDateSafe(a.start ?? a.fecha ?? a.date ?? a.dateISO)
        );
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
            data = [];
          } else {
            data = await getSubmissionsByUser(userId);
          }
        } else {
          // Profesor / superadmin usan panel /entregas
            data = await getEntregas(params);
        }
        const normalized = normalizeCollection(data, "entrega");
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
        let created;
        if (esAlumno) {
          const slotId = payload.slotId || payload.turnoId || payload.slot || null;
          if (!slotId) throw new Error("Falta slotId para crear la entrega del alumno.");
          created = await createSubmission(slotId, payload);
        } else {
          created = await apiCreateEntrega(payload);
        }
        const normalized = normalizeItem(created, "entrega");
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

  const createUsuarioRemoto = useCallback(
    async (payload = {}) => {
      start("usuarios-create");
      try {
        const creado = await apiCreateUsuario(payload);
        const normalizado = normalizeUsuario(creado);
        setUsuarios((prev) => {
          const base = normalizeUsuariosCollection(prev);
          return [...base, normalizado];
        });
        showToast("Usuario creado en servidor", "success");
        await loadUsuarios();
        return normalizado;
      } catch (error) {
        console.error("Error al crear usuario remoto", error);
        notifyError("No se pudo crear el usuario.", error, "Error creaciÇün usuario");
        throw error;
      } finally {
        stop("usuarios-create");
      }
    },
    [loadUsuarios, notifyError, setUsuarios, start, stop]
  );

  const updateUsuarioRemoto = useCallback(
    async (id, payload = {}) => {
      start("usuarios-update");
      try {
        const actualizado = await apiUpdateUsuario(id, payload);
        const normalizado = normalizeUsuario(actualizado);
        
        // WORKAROUND: Si el backend no devuelve cohorte pero se envió, persistir localmente
        const cohortDelPayload = payload.cohorte ?? payload.cohort;
        if (cohortDelPayload != null && (normalizado.cohorte == null && normalizado.cohort == null)) {
          normalizado.cohorte = cohortDelPayload;
          normalizado.cohort = cohortDelPayload;
        }
        
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
    [loadUsuarios, notifyError, setUsuarios, start, stop]
  );

  const deleteUsuarioRemoto = useCallback(
    async (id) => {
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
        notifyError("No se pudo eliminar el usuario.", error, "Error eliminaciÇün usuario");
        throw error;
      } finally {
        stop("usuarios-delete");
      }
    },
    [loadUsuarios, notifyError, setUsuarios, start, stop]
  );

  // --- CRUD de turnos disponible para dashboards ---
  const createTurno = useCallback(
    async (payload) => {
      start("turnos");
      try {
        // Forzar envío de módulo según el usuario/profesor autenticado
        // Para superadmin sin módulo asignado, usar fallback válido del enum backend
        const VALID_MODULES = ["HTML-CSS", "JAVASCRIPT", "FRONTEND - REACT", "BACKEND - NODE"];
        const FALLBACK_MODULE = "HTML-CSS";
        
        const moduloCandidato =
          payload?.modulo ??
          payload?.module ??
          usuario?.modulo ??
          usuario?.module ??
          usuario?.moduleLabel ??
          usuario?.moduloLabel ??
          null;

        // Validar que el módulo sea uno de los valores del enum, si no usar fallback
        const moduloNormalizado = String(moduloCandidato ?? "").trim().toUpperCase();
        const moduloValido = VALID_MODULES.find(
          (m) => m.toUpperCase() === moduloNormalizado
        );
        const moduloResuelto = moduloValido ?? FALLBACK_MODULE;

        const payloadConModulo = {
          ...payload,
          modulo: payload?.modulo ?? moduloResuelto,
          module: payload?.module ?? moduloResuelto,
        };

        console.log("[AppContext] createTurno - módulo resuelto:", moduloResuelto);
        console.log("[AppContext] createTurno - payload enviado:", payloadConModulo);

        const nuevo = await apiCreateTurno(payloadConModulo);
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

        // Mezcla preservando valores existentes para campos requeridos
        const mergeField = (field) => {
          const incoming = payload?.[field];
          if (incoming === undefined) return existente?.[field];
          if (typeof incoming === "string") {
            const trimmed = incoming.trim();
            return trimmed === "" ? existente?.[field] : trimmed;
          }
          return incoming;
        };

        const requestPayload = existente
          ? {
              ...existente,
              ...payload,
              titulo: mergeField("titulo"),
              descripcion: mergeField("descripcion"),
              modulo: mergeField("modulo"),
              comentarios: mergeField("comentarios"),
              zoomLink: mergeField("zoomLink"),
            }
          : payload;

        // PRESERVAR CAMPOS ACADÉMICOS: incluir siempre titulo/modulo/descripcion
        // Si el payload no los trae o están vacíos, usar los del turno existente.
        const cleanedPayload = { ...requestPayload };
        const ensureField = (field) => {
          const incoming = cleanedPayload?.[field];
          if (incoming === undefined || (typeof incoming === "string" && incoming.trim() === "")) {
            cleanedPayload[field] = existente?.[field] ?? cleanedPayload[field];
          }
        };
        ensureField("titulo");
        ensureField("modulo");
        ensureField("descripcion");
        // Asegurar autoría correcta: si no viene profesorId, preservar el existente
        if (
          cleanedPayload.profesorId === undefined ||
          cleanedPayload.profesorId === null ||
          (typeof cleanedPayload.profesorId === "string" && cleanedPayload.profesorId.trim() === "")
        ) {
          cleanedPayload.profesorId = existente?.profesorId ?? cleanedPayload.profesorId;
        }
        // Compatibilidad: algunos backends usan createdBy
        if (
          cleanedPayload.createdBy === undefined ||
          cleanedPayload.createdBy === null ||
          (typeof cleanedPayload.createdBy === "string" && cleanedPayload.createdBy.trim() === "")
        ) {
          cleanedPayload.createdBy = cleanedPayload.profesorId ?? existente?.createdBy ?? existente?.profesorId ?? cleanedPayload.createdBy;
        }
        // Normalizar room/sala: enviar room numérico siempre
        const salaVal = cleanedPayload.sala ?? existente?.sala ?? existente?.room;
        const salaNum = Number(salaVal);
        if (!Number.isNaN(salaNum) && salaNum > 0) {
          cleanedPayload.sala = salaNum; // Number per backend schema
          cleanedPayload.room = salaNum; // explicit numeric per schema
        } else if (typeof salaVal === "string" && salaVal.trim() !== "") {
          const num = Number(salaVal.replace(/[^0-9]/g, ""));
          if (!Number.isNaN(num) && num > 0) {
            cleanedPayload.sala = num;
            cleanedPayload.room = num;
          }
        }
        // Asegurar reviewNumber alias
        if (cleanedPayload.review !== undefined && cleanedPayload.reviewNumber === undefined) {
          cleanedPayload.reviewNumber = cleanedPayload.review;
        }
        // Asegurar date derivado de start/end si falta
        try {
          const iso = cleanedPayload.start ?? cleanedPayload.end ?? existente?.start ?? existente?.end;
          if (iso && !cleanedPayload.date) {
            const isoPart = new Date(iso).toISOString().slice(0, 10);
            cleanedPayload.date = isoPart;
            const [yyyy, mm, dd] = isoPart.split("-");
            if (yyyy && mm && dd && !cleanedPayload.fecha) {
              cleanedPayload.fecha = `${dd}/${mm}/${yyyy}`;
            }
          }
        } catch {}

        const actualizado = await apiUpdateTurno(id, cleanedPayload);
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

  // Cambio de estado de turno (usando endpoint dedicado /slots/:id/estado)
  const updateTurnoEstado = useCallback(
    async (id, estado) => {
      start("turnos");
      try {
        const actualizado = await actualizarEstadoSlot(id, estado);
        const normalizado = normalizeItem(actualizado, "turno");
        const targetId = normalizado?.id ?? id;
        const nextTurno = targetId != null
          ? { ...normalizado, id: targetId, estado: normalizado?.estado ?? estado }
          : null;
        if (!nextTurno) throw new Error("No se pudo resolver el turno actualizado.");

        setTurnos((prev) => {
          const base = Array.isArray(prev) ? normalizeCollection(prev, "turno") : [];
          const exists = base.some((t) => String(t.id) === String(targetId));
          if (exists) {
            return base.map((t) =>
              String(t.id) === String(targetId) ? { ...t, ...nextTurno } : t
            );
          }
          return [...base, nextTurno];
        });
        showToast("Estado de turno actualizado", "success");
        return nextTurno;
      } catch (error) {
        console.error("Error al actualizar estado del turno", error);
        showToast("No se pudo actualizar el estado del turno", "error");
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

  const findUsuarioById = useCallback(
    async (id) => {
      const cached = usuariosRef.current.find(
        (user) => String(user.id) === String(id)
      );
      if (cached) return cached;
      const listado = await loadUsuarios();
      return listado.find((user) => String(user.id) === String(id)) ?? null;
    },
    [loadUsuarios]
  );

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
        findUsuarioById,
        loadTurnos,
        loadEntregas,
        loadUsuarios,
        createEntrega,
        updateEntrega,
        removeEntrega,
        approveUsuario: approveUsuarioRemoto,
        updateUsuarioEstado: updateUsuarioEstadoRemoto,
        updateUsuario: updateUsuarioRemoto,
        updateUsuarioRemoto,
        createTurno,
        updateTurno,
        updateTurnoEstado,
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
        createUsuarioRemoto,
        updateUsuarioRemoto,
        deleteUsuarioRemoto,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => useContext(AppContext);
