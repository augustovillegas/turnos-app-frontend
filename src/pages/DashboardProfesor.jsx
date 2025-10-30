// === Dashboard Profesor ===
// Panel del docente: aprobar/rechazar turnos, gestionar usuarios y crear slots.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/layout/SideBar";
import { useAppData } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useLoading } from "../context/LoadingContext";
import { useError } from "../context/ErrorContext";
import { showToast } from "../utils/feedback/toasts";

// === Secciones del dashboard ===
import { CreateTurnos } from "./CreateTurnos";
import { EvaluarEntregas } from "./EvaluarEntregas";
import { Configuracion } from "./Configuracion";
import { SolicitudesTurnos } from "./SolicitudesTurnos";
import { UsuariosPendientes } from "./UsuariosPendientes";

const ITEMS_PER_PAGE = 5;

export const DashboardProfesor = () => {
  // === Contextos globales ===
  const { turnos, usuarios, loadTurnos, loadEntregas, loadUsuarios } =
    useAppData();
  const { usuario: usuarioActual, token, cerrarSesion } = useAuth();
  const { pushError } = useError();
  const navigate = useNavigate();
  const { isLoading } = useLoading();
  const { showModal } = useModal();

  // === Estado local ===
  const [active, setActive] = useState("solicitudes");

  // === Deducción del módulo del profesor ===
  const moduloActual = useMemo(() => {
    if (!usuarioActual) return null;
    const posibles = [
      usuarioActual.cohort,
      usuarioActual.cohorte,
      usuarioActual.modulo,
      usuarioActual.module,
    ];
    return posibles.find((m) => m && String(m).trim() !== "") ?? null;
  }, [usuarioActual]);

  const moduloActualStr = moduloActual?.toString().toLowerCase().trim() ?? null;

  const coincideModulo = (obj) => {
    if (!obj || typeof obj !== "object") return false;
    const campos = [
      obj?.modulo,
      obj?.module,
      obj?.cohort,
      obj?.cohorte,
      obj?.moduloId,
      obj?.cohortId,
      obj?.datos?.modulo,
      obj?.datos?.cohort,
    ];
    return campos.some((val) =>
      typeof val === "string"
        ? val.toLowerCase().trim() === moduloActualStr
        : false
    );
  };

  // === Filtrado de datos por módulo ===
  const turnosDelModulo = useMemo(
    () => (turnos || []).filter(coincideModulo),
    [turnos, moduloActualStr]
  );

  const usuariosDelModulo = useMemo(
    () => (usuarios || []).filter(coincideModulo),
    [usuarios, moduloActualStr]
  );

  // === Carga inicial de datos del módulo ===
  useEffect(() => {
    if (!usuarioActual || !token || usuarioActual.role !== "profesor") return;
    (async () => {
      try {
        await Promise.all([loadTurnos(), loadEntregas(), loadUsuarios()]);
      } catch (error) {
        showToast("Error al cargar datos del módulo", "error");
        pushError?.("Fallo al obtener datos del módulo", {
          description: error?.message,
        });
      }
    })();
  }, [usuarioActual, token, loadTurnos, loadEntregas, loadUsuarios, pushError]);

  // === Manejo de navegación ===
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

  // === Render principal ===
  return (
    <div className="flex min-h-screen bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <SideBar
        items={[
          {
            id: "solicitudes",
            label: "Solicitudes Pendientes",
            icon: "/icons/calendar-1.png",
          },
          {
            id: "usuarios",
            label: "Usuarios Pendientes",
            icon: "/icons/users_key-4.png",
          },
          {
            id: "crear-turnos",
            label: "Crear Turnos",
            icon: "/icons/directory_explorer-5.png",
          },
          {
            id: "evaluar-entregas",
            label: "Evaluar Entregables",
            icon: "/icons/briefcase-4.png",
          },
        ]}
        active={active}
        onSelect={handleSidebarSelect}
      />

      <div className="flex-1 p-6">
        {/* =========================
            SECCION: SOLICITUDES DE TURNOS
        ========================== */}
        {active === "solicitudes" && (
          <SolicitudesTurnos
            turnos={turnosDelModulo}
            isLoading={isLoading("turnos")}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}

        {/* =========================
            SECCION: SOLICITUD USUARIOS
        ========================== */}
        {active === "usuarios" && (
          <UsuariosPendientes
            usuarios={usuariosDelModulo}
            isLoading={isLoading("usuarios")}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}

        {/* =========================
            SECCION: CREAR TURNOS
        ========================== */}
        {active === "crear-turnos" && <CreateTurnos />}

        {/* =========================
            SECCION: EVALUAR ENTREGAS
        ========================== */}
        {active === "evaluar-entregas" && <EvaluarEntregas />}

        {/* =========================
            SECCION: CONFIGURACION
        ========================== */}
        {active === "config" && <Configuracion />}
      </div>
    </div>
  );
};
