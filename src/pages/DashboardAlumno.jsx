// === Dashboard Alumno ===
// Panel del estudiante: solicitar turnos, ver historial y cargar entregables.
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/layout/SideBar";
import { useAppData } from "../context/AppContext";
import { showToast } from "../utils/feedback/toasts";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useLoading } from "../context/LoadingContext";
import { useError } from "../context/ErrorContext";
import { ensureModuleLabel, coincideModulo, labelToModule, moduleToLabel } from "../utils/moduleMap";
import { normalizeEstado, isEstado, anyEstado } from "../utils/turnos/normalizeEstado";

// Secciones modulares
import { TurnosDisponibles } from "./TurnosDisponibles";
import { MisTurnos } from "./MisTurnos";
import { Entregables } from "./Entregables";
import { Configuracion } from "./Configuracion";

export const DashboardAlumno = () => {
  // --- Contextos globales ---
  const {
    turnos,
    solicitarTurno,
    cancelarTurno,
    entregas,
    loadTurnos,
    loadEntregas,
    createEntrega: createEntregaRemoto,
    removeEntrega: removeEntregaRemoto,
  } = useAppData();

  const { usuario: usuarioActual, token, cerrarSesion } = useAuth();
  const { showModal } = useModal();
  const { isLoading } = useLoading();
  const turnosLoading = isLoading("turnos");
  const { pushError } = useError();
  const navigate = useNavigate();

  // --- ID del alumno ---
  const alumnoId = useMemo(() => {
    if (!usuarioActual) return null;
    const posibles = [
      usuarioActual._id,
      usuarioActual.id,
      usuarioActual.uid,
      usuarioActual.alumnoId,
      usuarioActual.alumno?.id,
      usuarioActual.alumno?._id,
      usuarioActual.profile?.id,
      usuarioActual.profile?._id,
    ];
    return posibles.find((x) => x && String(x).trim() !== "") ?? null;
  }, [usuarioActual]);
  const alumnoIdStr = alumnoId ? String(alumnoId).trim() : null;

  const cohortAlumno = useMemo(() => {
    if (!usuarioActual) return null;
    const candidatos = [
      usuarioActual.cohort,
      usuarioActual.cohorte,
      usuarioActual.cohortId,
      usuarioActual?.datos?.cohort,
      usuarioActual.moduleCode,
      usuarioActual.moduleNumber,
    ];
    for (const candidato of candidatos) {
      const modulo = labelToModule(candidato);
      if (modulo != null) return modulo;
    }
    const etiqueta = ensureModuleLabel(
      usuarioActual.modulo ?? usuarioActual.module ?? usuarioActual.moduloSlug
    );
    if (etiqueta) {
      const modulo = labelToModule(etiqueta);
      if (modulo != null) return modulo;
    }
    return null;
  }, [usuarioActual]);

  const moduloAlumno = useMemo(() => {
    if (!usuarioActual) return null;
    const etiquetaDirecta = [
      ensureModuleLabel(usuarioActual.modulo),
      ensureModuleLabel(usuarioActual.module),
      ensureModuleLabel(usuarioActual.moduloSlug),
      ensureModuleLabel(usuarioActual.moduleCode),
      ensureModuleLabel(usuarioActual.moduleNumber),
    ].find(Boolean);
    if (etiquetaDirecta) return etiquetaDirecta;
    return moduleToLabel(cohortAlumno);
  }, [usuarioActual, cohortAlumno]);

  const resolveComparableId = (value) => {
    if (!value) return null;
    if (typeof value === "object") {
      return (
        value.id ??
        value._id ??
        value.$oid ??
        value.uid ??
        value.userId ??
        value.usuarioId ??
        value.alumnoId ??
        value.estudianteId ??
        value.studentId ??
        null
      );
    }
    return String(value).trim() || null;
  };

  const isTurnoDelAlumno = useCallback(
    (turno) => {
      if (!alumnoIdStr) return false;
      const candidatos = [
        turno.alumnoId,
        turno.alumno?.id,
        turno.alumno?._id,
        turno.solicitanteId,
        turno.solicitante?.id,
        turno.userId,
        turno.usuarioId,
      ];
      return candidatos.some((c) => resolveComparableId(c) === alumnoIdStr);
    },
    [alumnoIdStr]
  );

  const isEntregaDelAlumno = useCallback(
    (entrega) => {
      if (!alumnoIdStr) return false;
      const candidatos = [
        entrega.alumnoId,
        entrega.alumno?.id,
        entrega.alumno?._id,
        entrega.userId,
        entrega.usuarioId,
      ];
      return candidatos.some((c) => resolveComparableId(c) === alumnoIdStr);
    },
    [alumnoIdStr]
  );

  // --- Estado local ---
  const [active, setActive] = useState("turnos");
  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingTurno, setProcessingTurno] = useState(null);

  // --- Configuración de paginación ---
  const ITEMS_PER_PAGE = 5;
  const [pageTurnosDisponibles, setPageTurnosDisponibles] = useState(1);
  const [pageMisTurnos, setPageMisTurnos] = useState(1);

  // --- Cargar turnos y entregas al iniciar ---
  const hasLoadedRef = useRef(false);
  useEffect(() => {
    if (hasLoadedRef.current) return; // evita recarga múltiple si cambian dependencias estructurales
    if (!usuarioActual || !token || usuarioActual.role !== "alumno") return;
    const filtrosTurnos = {};
    if (cohortAlumno != null) filtrosTurnos.cohort = cohortAlumno;
    if (moduloAlumno) filtrosTurnos.modulo = moduloAlumno;
    hasLoadedRef.current = true;
    (async () => {
      try {
        await Promise.all([loadTurnos(filtrosTurnos), loadEntregas()]);
      } catch (error) {
        pushError?.("Error al cargar datos del alumno", {
          description: error?.message ?? "Fallo al recuperar información.",
        });
      }
    })();
  }, [usuarioActual, token, cohortAlumno, moduloAlumno, loadTurnos, loadEntregas, pushError]);

  // --- Manejo de turnos ---
  const handleSolicitarTurno = async (turno) => {
    if (!turno || !isEstado(turno.estado, "disponible") || !alumnoIdStr) return;
    setProcessingTurno(turno.id);
    try {
      await solicitarTurno(turno.id);
      showToast("Turno solicitado correctamente", "success");
    } catch (error) {
      pushError?.("Error al solicitar turno", { description: error.message });
    } finally {
      setProcessingTurno(null);
    }
  };

  const handleCancelarTurno = (turno) => {
    if (!turno || !isEstado(turno.estado, "solicitado")) return;
    showModal({
      type: "warning",
      title: "Cancelar solicitud",
      message: `¿Cancelar la solicitud para la sala ${turno.sala}?`,
      onConfirm: async () => {
        setProcessingTurno(turno.id);
        try {
          await cancelarTurno(turno.id);
          showToast("Solicitud cancelada", "info");
        } catch (error) {
          pushError?.("Error al cancelar turno", {
            description: error.message,
          });
        } finally {
          setProcessingTurno(null);
        }
      },
    });
  };

  // --- Manejo de entregas ---
  const handleAgregarEntrega = async ({
    sprint,
    githubLink,
    renderLink,
    comentarios,
  }) => {
    const validation = {};
    if (!sprint) validation.sprint = "Selecciona el sprint a entregar.";
    if (!githubLink?.trim())
      validation.githubLink = "Ingresa el enlace del repositorio.";
    else if (!githubLink.startsWith("http"))
      validation.githubLink = "El enlace de GitHub debe ser válido.";
    if (renderLink && !renderLink.startsWith("http"))
      validation.renderLink = "El enlace de Render debe ser válido.";

    if (Object.keys(validation).length > 0) {
      showToast("Revisa los datos de la entrega.", "warning");
      return;
    }

    if (!alumnoIdStr) {
      pushError?.("No se pudo identificar al alumno al crear la entrega");
      return;
    }

    // Seleccionar un slot reservado (turno 'Solicitado') del alumno para asociar la entrega.
    const slotElegido = (Array.isArray(turnos) ? turnos : []).find(
      (t) => t && isEstado(t.estado, "solicitado") && isTurnoDelAlumno(t)
    );
    if (!slotElegido) {
      showToast(
        "Necesitas tener un turno reservado (Solicitado) para registrar la entrega.",
        "warning"
      );
      return;
    }

    // No usar try/catch; lanzar error para que Entregables.jsx lo capture y extraiga errores de campo
    // Según backend: POST /submissions/:id donde id = slotId
    await createEntregaRemoto({
      slotId: slotElegido.id,
      sprint: Number(sprint),
      githubLink: githubLink.trim(),
      renderLink: renderLink.trim(),
      comentarios: comentarios.trim(),
      reviewStatus: "A revisar",  // Backend acepta solo reviewStatus (NO estado)
    });
    showToast("Entrega registrada correctamente", "success");
  };

  const handleCancelarEntrega = (entrega) => {
    if (!entrega?.id) return;
    showModal({
      type: "warning",
      title: "Cancelar entrega",
      message: `¿Cancelar la entrega del sprint ${entrega.sprint}?`,
      onConfirm: async () => {
        try {
          await removeEntregaRemoto(entrega.id);
          showToast("Entrega cancelada", "info");
        } catch (error) {
          pushError?.("Error al cancelar entrega", {
            description: error.message,
          });
        }
      },
    });
  };

  // --- Filtros ---
  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  const turnosFiltradosPorModulo = useMemo(() => {
    if (!moduloAlumno && cohortAlumno == null) return turnos || [];
    return (turnos || []).filter(
      (turno) => coincideModulo(turno, moduloAlumno, cohortAlumno) || isTurnoDelAlumno(turno)
    );
  }, [
    turnos,
    moduloAlumno,
    cohortAlumno,
    isTurnoDelAlumno,
  ]);

  const turnosDisponibles = aplicarFiltro(
    turnosFiltradosPorModulo.filter(
      (t) => anyEstado(t.estado, ["disponible"]) || isTurnoDelAlumno(t)
    )
  );

  const turnosHistorial = aplicarFiltro(
    turnosFiltradosPorModulo.filter(
      (t) => isTurnoDelAlumno(t) && anyEstado(t.estado, ["solicitado", "aprobado", "rechazado"])
    )
  );

  const entregasAlumno = (entregas || []).filter(isEntregaDelAlumno);
  const isEntregasSectionLoading = isLoading("entregas");

  // --- Sidebar ---
  const handleSidebarSelect = (id) => {
    if (id === "cerrar-sesion") {
      showModal({
        type: "warning",
        title: "¿Cerrar sesión?",
        message: "¿Estás seguro de que deseas cerrar sesión?",
        onConfirm: () => {
          cerrarSesion();
          showToast("Sesión cerrada correctamente", "info");
          navigate("/", { replace: true });
        },
      });
      return;
    }
    setActive(id);
  };

  // --- Render principal ---
  return (
    <div className="flex min-h-screen bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <SideBar
        items={[
          {
            id: "turnos",
            label: "Solicitar turnos",
            icon: "/icons/calendar-1.png",
          },
          {
            id: "mis-turnos",
            label: "Mis turnos",
            icon: "/icons/directory_explorer-5.png",
          },
          {
            id: "Entregables",
            label: "Entregables",
            icon: "/icons/directory_net_web-4.png",
          },
        ]}
        active={active}
        onSelect={handleSidebarSelect}
      />
      <div className="flex-1 p-6">
        {/* =========================
            SECCION: TURNOS DISPONIBLES
        ========================== */}
        {active === "turnos" && (
          <TurnosDisponibles
            turnos={turnosDisponibles}
            onSolicitar={handleSolicitarTurno}
            processingTurno={processingTurno}
            isTurnosSectionLoading={turnosLoading}
            setPageTurnosDisponibles={setPageTurnosDisponibles}
            pageTurnosDisponibles={pageTurnosDisponibles}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
            filtroReview={filtroReview}
            setFiltroReview={setFiltroReview}
            handleCancelarTurno={handleCancelarTurno}
          />
        )}

        {/* =========================
            SECCION: MIS TURNOS
        ========================== */}
        {active === "mis-turnos" && (
          <MisTurnos
            turnos={turnosHistorial}
            handleCancelarTurno={handleCancelarTurno}
            processingTurno={processingTurno}
            isTurnosSectionLoading={turnosLoading}
            filtroReview={filtroReview}
            setFiltroReview={setFiltroReview}
            pageMisTurnos={pageMisTurnos}
            setPageMisTurnos={setPageMisTurnos}
            ITEMS_PER_PAGE={ITEMS_PER_PAGE}
          />
        )}

        {/* =========================
            SECCION: ENTREGABLES
        ========================== */}
        {active === "Entregables" && (
          <Entregables
            entregas={entregas} // Backend filtra via /submissions/:userId (solo propias del alumno)
            onAgregarEntrega={handleAgregarEntrega}
            onCancelarEntrega={handleCancelarEntrega}
            entregasLoading={isEntregasSectionLoading}
          />
        )}

        {/* =========================
            SECCION: CONFIGURACION
        ========================== */}
        {active === "config" && <Configuracion />}
      </div>
    </div>
  );
};

