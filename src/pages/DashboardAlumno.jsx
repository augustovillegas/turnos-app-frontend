// === Dashboard Alumno ===
// Panel del estudiante: solicitar turnos, ver historial y cargar entregables.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/layout/SideBar";
import { useAppData } from "../context/AppContext";
import { showToast } from "../utils/feedback/toasts";
import { buildTurnoPayloadFromForm, formValuesFromTurno } from "../utils/turnos/form";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useLoading } from "../context/LoadingContext";
import { useError } from "../context/ErrorContext";

// Secciones modulares
import { TurnosDisponibles } from "./TurnosDisponibles";
import { MisTurnos } from "./MisTurnos";
import { Entregables } from "./Entregables";
import { Configuracion } from "./Configuracion";

export const DashboardAlumno = () => {
  // --- Contextos globales ---
  const {
    turnos,
    updateTurno,
    turnosLoading,
    entregas,
    loadTurnos,
    loadEntregas,
    createEntrega: createEntregaRemoto,
    removeEntrega: removeEntregaRemoto,
  } = useAppData();

  const { usuario: usuarioActual, token, cerrarSesion } = useAuth();
  const { showModal } = useModal();
  const { isLoading } = useLoading();
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

  const isTurnoDelAlumno = (turno) => {
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
  };

  const isEntregaDelAlumno = (entrega) => {
    if (!alumnoIdStr) return false;
    const candidatos = [
      entrega.alumnoId,
      entrega.alumno?.id,
      entrega.alumno?._id,
      entrega.userId,
      entrega.usuarioId,
    ];
    return candidatos.some((c) => resolveComparableId(c) === alumnoIdStr);
  };

  // --- Estado local ---
  const [active, setActive] = useState("turnos");
  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingTurno, setProcessingTurno] = useState(null);

  // --- Configuración de paginación ---
  const ITEMS_PER_PAGE = 5;
  const [pageTurnosDisponibles, setPageTurnosDisponibles] = useState(1);
  const [pageMisTurnos, setPageMisTurnos] = useState(1);

  // --- Cargar turnos y entregas al iniciar ---
  useEffect(() => {
    if (!usuarioActual || !token) return;
    (async () => {
      try {
        await Promise.all([loadTurnos(), loadEntregas()]);
      } catch (error) {
        pushError?.("Error al cargar datos del alumno", {
          description: error?.message ?? "Fallo al recuperar información.",
        });
      }
    })();
  }, [usuarioActual, token, loadTurnos, loadEntregas, pushError]);

  // --- Manejo de turnos ---
  const handleSolicitarTurno = async (turno) => {
    if (!turno || turno.estado !== "Disponible" || !alumnoIdStr) return;
    setProcessingTurno(turno.id);
    try {
      const payload = {
        ...buildTurnoPayloadFromForm({
          ...formValuesFromTurno(turno),
          review: turno.review,
          estado: "Solicitado",
        }),
        solicitanteId: alumnoIdStr,
      };
      await updateTurno(turno.id, payload);
      showToast("Turno solicitado correctamente", "success");
    } catch (error) {
      pushError?.("Error al solicitar turno", { description: error.message });
    } finally {
      setProcessingTurno(null);
    }
  };

  const handleCancelarTurno = (turno) => {
    if (!turno || turno.estado !== "Solicitado") return;
    showModal({
      type: "warning",
      title: "Cancelar solicitud",
      message: `¿Cancelar la solicitud para la sala ${turno.sala}?`,
      onConfirm: async () => {
        setProcessingTurno(turno.id);
        try {
          const payload = {
            ...buildTurnoPayloadFromForm({
              ...formValuesFromTurno(turno),
              estado: "Disponible",
            }),
            solicitanteId: null,
          };
          await updateTurno(turno.id, payload);
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

    try {
      await createEntregaRemoto({
        sprint: Number(sprint),
        githubLink: githubLink.trim(),
        renderLink: renderLink.trim(),
        comentarios: comentarios.trim(),
        reviewStatus: "A revisar",
        estado: "A revisar",
        alumnoId: alumnoIdStr,
        modulo: usuarioActual?.modulo ?? usuarioActual?.cohort ?? "",
      });
      showToast("Entrega registrada correctamente", "success");
    } catch (error) {
      pushError?.("Error al registrar la entrega", {
        description: error.message,
      });
    }
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

  const turnosDisponibles = aplicarFiltro(
    (turnos || []).filter(
      (t) =>
        ["disponible"].includes(String(t.estado || "").toLowerCase()) ||
        isTurnoDelAlumno(t)
    )
  );

  const turnosHistorial = aplicarFiltro(
    (turnos || []).filter(
      (t) =>
        isTurnoDelAlumno(t) &&
        ["solicitado", "aprobado", "rechazado"].includes(
          String(t.estado || "").toLowerCase()
        )
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
            isTurnosSectionLoading={turnosLoading || isLoading("turnos")}
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
            isTurnosSectionLoading={turnosLoading || isLoading("turnos")}
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
            entregas={entregas}
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
