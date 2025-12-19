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
  solicitarSlot,
  cancelarSlot,
} from "../services/turnosService";
import {
  getEntregas,
  createEntrega as apiCreateEntrega,
  updateEntrega as apiUpdateEntrega,
  deleteEntrega as apiDeleteEntrega,
} from "../services/entregasService"; // Panel admin (profesor/superadmin)
import {
  getSubmissionsByUser,
  updateSubmission,
  deleteSubmission,
} from "../services/submissionsService"; // Flujo alumno
import {
  getUsuarios,
  approveUsuario as apiApproveUsuario,
  updateUsuarioEstado as apiUpdateUsuarioEstado,
  createUsuario as apiCreateUsuario,
  updateUsuario as apiUpdateUsuario,
  updateUsuarioAuth as apiUpdateUsuarioAuth,
  deleteUsuario as apiDeleteUsuario,
} from "../services/usuariosService";
import { ensureModuleLabel, MODULE_LABELS } from "../utils/moduleMap";
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

const getRol = (user) =>
  user?.rol ??
  user?.role ??
  user?.tipo ??
  null;

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
        const remoteTurnos = await getTurnos(params);
        const normalized = normalizeCollection(remoteTurnos, "turno").sort(
          (a, b) =>
            parseDateSafe(b.fecha ?? b.fechaISO ?? b.start) -
            parseDateSafe(a.fecha ?? a.fechaISO ?? a.start)
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
        const esAlumno = getRol(usuario) === "alumno";
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
          // Profesor / superadmin usan panel /submissions
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
      const rolActual = getRol(usuario);
      if (rolActual !== "superadmin" && rolActual !== "profesor") {
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
        const esAlumno = getRol(usuario) === "alumno";
        if (!esAlumno) {
          throw new Error("Solo los alumnos pueden registrar entregas.");
        }
        const slotId = payload.slotId || payload.turnoId || payload.slot || null;
        if (!slotId) throw new Error("Falta slotId para crear la entrega del alumno.");
        const created = await apiCreateEntrega({ ...payload, slotId });
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
        const esAlumno = getRol(usuario) === "alumno";
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
        const esAlumno = getRol(usuario) === "alumno";
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
        const moduloCandidato = payload?.modulo ?? usuario?.modulo ?? MODULE_LABELS?.[0] ?? null;
        const moduloResuelto = ensureModuleLabel(moduloCandidato) ?? MODULE_LABELS?.[0];
        const cohorteResuelto = (() => {
          const n = Number(payload?.cohorte ?? usuario?.cohorte);
          if (Number.isFinite(n) && n >= 1) return n;
          return 1;
        })();

        const payloadConModulos = {
          ...payload,
          modulo: moduloResuelto,
          cohorte: cohorteResuelto,
        };

        const creado = await apiCreateUsuario(payloadConModulos);
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
        const existenteUsuario = usuariosRef.current.find((u) => String(u.id) === String(id));
        const moduloCandidato =
          payload?.modulo ??
          existenteUsuario?.modulo ??
          usuario?.modulo ??
          MODULE_LABELS?.[0] ??
          null;
        const moduloResuelto = ensureModuleLabel(moduloCandidato) ?? MODULE_LABELS?.[0];
        const cohorteResuelto = (() => {
          const n = Number(payload?.cohorte ?? existenteUsuario?.cohorte ?? usuario?.cohorte);
          if (Number.isFinite(n) && n >= 1) return n;
          return 1;
        })();

        const payloadConModulos = {
          ...payload,
          modulo: moduloResuelto,
          cohorte: cohorteResuelto,
        };

        let actualizado;
        try {
          actualizado = await apiUpdateUsuario(id, payloadConModulos);
        } catch (err) {
          // Si el endpoint admin devuelve 403 (profesor sin permisos), reintentar con /auth/usuarios
          if (err?.response?.status === 403) {
            actualizado = await apiUpdateUsuarioAuth(id, payloadConModulos);
          } else {
            throw err;
          }
        }
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
        const moduloCandidato = payload?.modulo ?? usuario?.modulo ?? MODULE_LABELS?.[0] ?? null;
        const moduloResuelto = ensureModuleLabel(moduloCandidato) ?? MODULE_LABELS?.[0];

        const cohorteResuelto = (() => {
          const raw = payload?.cohorte ?? usuario?.cohorte;
          const n = Number(raw);
          if (Number.isFinite(n) && n >= 1) return n;
          return 1;
        })();

        const payloadConModulo = {
          ...payload,
          modulo: moduloResuelto,
          cohorte: cohorteResuelto,
        };

        const nuevo = await apiCreateTurno(payloadConModulo);
        const normalized = normalizeItem(nuevo);
        if (!normalized) {
          throw new Error("Respuesta invalida al crear turno.");
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
    [setTurnos, start, stop, usuario]
  );
  const updateTurno = useCallback(
    async (id, payload = {}) => {
      start("turnos");
      try {
        const currentList = turnosRef.current;
        const existente = currentList.find(
          (turno) => String(turno.id) === String(id)
        );

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

        if (
          cleanedPayload.profesorId === undefined ||
          cleanedPayload.profesorId === null ||
          (typeof cleanedPayload.profesorId === "string" && cleanedPayload.profesorId.trim() === "")
        ) {
          cleanedPayload.profesorId = existente?.profesorId ?? cleanedPayload.profesorId;
        }
        if (
          cleanedPayload.createdBy === undefined ||
          cleanedPayload.createdBy === null ||
          (typeof cleanedPayload.createdBy === "string" && cleanedPayload.createdBy.trim() === "")
        ) {
          cleanedPayload.createdBy =
            cleanedPayload.profesorId ??
            existente?.createdBy ??
            existente?.profesorId ??
            cleanedPayload.createdBy;
        }

        const salaVal = cleanedPayload.sala ?? existente?.sala;
        if (salaVal !== undefined) {
          const salaNum = Number(salaVal);
          if (!Number.isNaN(salaNum) && salaNum > 0) {
            cleanedPayload.sala = salaNum;
          }
        }

      if (cleanedPayload.review !== undefined && cleanedPayload.reviewNumber === undefined) {
        cleanedPayload.reviewNumber = cleanedPayload.review;
      }

      const moduloCandidato =
        ensureModuleLabel(cleanedPayload?.modulo ?? usuario?.modulo ?? MODULE_LABELS?.[0]) ??
        MODULE_LABELS?.[0];
      cleanedPayload.modulo = moduloCandidato;

      const cohorteVal = Number(cleanedPayload?.cohorte ?? existente?.cohorte ?? usuario?.cohorte);
      cleanedPayload.cohorte = Number.isFinite(cohorteVal) && cohorteVal >= 1 ? cohorteVal : 1;

      if (!cleanedPayload.fecha) {
        try {
          const iso = cleanedPayload.start ?? cleanedPayload.end ?? existente?.start ?? existente?.end;
          if (iso) {
            cleanedPayload.fecha = new Date(iso).toISOString().slice(0, 10);
            }
          } catch (e) {
            // Ignorar derivacion de fecha si falla
          }
        }

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
  const updateTurnoEstado = useCallback(
    async (id, estado) => {
      start("turnos");
      try {
        const normalizeEstadoInput = (value) =>
          String(value ?? "").trim().toLowerCase();
        const allowedBackendEstados = ["Aprobado", "Rechazado", "Solicitado", "Disponible", "Desaprobado"];
        const mapToBackendEstado = (value) => {
          const normalized = normalizeEstadoInput(value);
          const match = allowedBackendEstados.find(
            (item) => normalizeEstadoInput(item) === normalized
          );
          if (match) return match;
          if (/^aprobado/.test(normalized)) return "Aprobado";
          if (/^rechazado|^desaprobado|^cancelado/.test(normalized)) return "Rechazado";
          if (/^solicitado/.test(normalized)) return "Solicitado";
          if (/^disponible/.test(normalized)) return "Disponible";
          return "Rechazado";
        };
        const mapToUiEstado = (value) => {
          const normalized = normalizeEstadoInput(value);
          if (normalized === "aprobado" || normalized === "approved") return "Aprobado";
          if (
            normalized === "rechazado" ||
            normalized === "desaprobado" ||
            normalized === "cancelado" ||
            normalized === "canceled" ||
            normalized === "cancelled"
          ) {
            return "Rechazado";
          }
          if (
            normalized === "pendiente" ||
            normalized === "pending" ||
            normalized === "a revisar" ||
            normalized === "por revisar"
          ) {
            return "Pendiente";
          }
          return "Rechazado";
        };
        const mapReviewStatus = (value) => {
          const normalized = normalizeEstadoInput(value);
          if (normalized === "aprobado" || normalized === "approved") return "Aprobado";
          if (
            normalized === "cancelado" ||
            normalized === "rechazado" ||
            normalized === "desaprobado" ||
            normalized === "canceled" ||
            normalized === "cancelled"
          ) {
            return "Desaprobado";
          }
          if (
            normalized === "pendiente" ||
            normalized === "pending" ||
            normalized === "a revisar" ||
            normalized === "por revisar"
          ) {
            return "A revisar";
          }
          return null;
        };

        const backendEstado = mapToBackendEstado(estado || "Cancelado");
        const fallbackUiEstado = mapToUiEstado(backendEstado || estado || "Cancelado");

        const actualizado = await actualizarEstadoSlot(id, backendEstado);
        const normalizado = normalizeItem(actualizado, "turno");
        const targetId = normalizado?.id ?? id;
        const resolvedReviewStatus = normalizado?.reviewStatus ?? mapReviewStatus(backendEstado);
        const resolvedUiEstado = normalizado?.estado ?? fallbackUiEstado;
        const nextTurno = targetId != null
          ? {
              ...normalizado,
              id: targetId,
              estado: resolvedUiEstado,
              ...(resolvedReviewStatus ? { reviewStatus: resolvedReviewStatus } : {}),
            }
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
        deleteUsuarioRemoto,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => useContext(AppContext);
