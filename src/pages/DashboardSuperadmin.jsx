// === Dashboard Superadmin ===
// Panel general: gestión global de usuarios, turnos y entregas.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/layout/SideBar";
import { LayoutWrapper } from "../components/layout/LayoutWrapper";
import { CreateTurnos } from "./CreateTurnos";
import { useAppData } from "../context/AppContext";
import { EvaluarEntregas } from "./EvaluarEntregas";
import { Configuracion } from "./Configuracion";
import { showToast } from "../utils/feedback/toasts";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";
import { useError } from "../context/ErrorContext";
import { useModal } from "../context/ModalContext";
import { CreateUsers } from "./CreateUsers";
import { SolicitudesTurnos } from "./SolicitudesTurnos";
import { UsuariosPendientes } from "./UsuariosPendientes";
import { DashboardKpiSection } from "../components/metrics/DashboardKpiSection";

export const DashboardSuperadmin = () => {
  // --- Contexto global con acceso a todo el sistema ---
  const {
    turnos,
    usuarios,
    entregas,
    loadTurnos,
    loadEntregas,
    loadUsuarios,
  } = useAppData();
  const navigate = useNavigate();
  const { usuario: usuarioActual, cerrarSesion } = useAuth();
  const { isLoading } = useLoading();
  const { pushError } = useError();
  const { showModal } = useModal();

  // --- Estado local: solo la pestaña activa ---
  const [active, setActive] = useState("usuarios");
  const ITEMS_PER_PAGE = 5;

  // --- Carga inicial de datos globales ---
  useEffect(() => {
    if (!usuarioActual) return;
    if ((usuarioActual?.rol ?? usuarioActual?.role) !== "superadmin") return;

    const fetchData = async () => {
      try {
        // Backend filtra automáticamente por módulo del usuario
        // - turnos: sin parámetros, backend devuelve los del módulo actual
        // - usuarios: sin filtro de módulo, obtenemos todos los usuarios
        await Promise.all([
          loadTurnos({}), 
          loadEntregas(), 
          loadUsuarios({})
        ]);
      } catch (error) {
        showToast("No se pudieron cargar los datos generales.", "error");
        if (pushError) {
          pushError("Error al cargar datos globales.", {
            description:
              error?.message ||
              "Fallo inesperado al obtener turnos, entregas y usuarios.",
          });
        }
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [usuarioActual]);

  const handleSidebarSelect = (id) => {
    if (id === "cerrar-sesion") {
      showModal({
        type: "warning",
        title: "¿Cerrar sesión?",
        message: "¿Estás seguro de que deseas cerrar sesión?",
        onConfirm: () => {
          cerrarSesion();
          navigate("/", { replace: true });
        },
      });
      return;
    }
    setActive(id);
  };

  return (
    <div className="flex min-h-screen bg-[#017F82] transition-colors duration-300 dark:bg-[#0F3D3F]">
      <SideBar
        items={[
          {
            id: "usuarios",
            label: "Gestión de Usuarios",
            icon: "/icons/users_key-4.png",
          },          
          {
            id: "turnos",
            label: "Solicitudes de Turnos",
            icon: "/icons/calendar-1.png",
          },
          {
            id: "evaluar-entregas",
            label: "Evaluar Entregables",
            icon: "/icons/briefcase-4.png",
          },
          {
            id: "crear-turnos",
            label: "Crear Turnos",
            icon: "/icons/directory_explorer-5.png",
          },
          {
            id: "cargar-usuarios",
            label: "Cargar Usuarios",
            icon: "/icons/address_book_pad_users.png",
          },
           {
            id: "metricas",
            label: "Métricas",
            icon: "/icons/chart1-4.png",
          },         
        ]}
        active={active}
        onSelect={handleSidebarSelect}
      />

      <LayoutWrapper
        as="main"
        className="flex-1 text-[#111827] dark:text-gray-100 transition-colors duration-300"
        maxWidthClass="max-w-6xl"
      >
        {/* =========================
          SECCIÓN: GESTIÓN USUARIOS
        ========================== */}
        {active === "usuarios" && (
          <UsuariosPendientes
            usuarios={usuarios}
            isLoading={isLoading("usuarios")}
            itemsPerPage={ITEMS_PER_PAGE}
            withWrapper={false}
          />
        )}

        {/* =========================
          SECCIÓN: MÉTRICAS
        ========================== */}
        {active === "metricas" && (
          <DashboardKpiSection
            role="superadmin"
            usuarios={usuarios}
            turnos={turnos}
            entregas={entregas}
            withWrapper={false}
          />
        )}

        {/* =========================
          SECCIÓN: SOLICITUDES DE TURNOS
        ========================== */}
        {active === "turnos" && (
          <SolicitudesTurnos
            turnos={turnos}
            isLoading={isLoading("turnos")}
            itemsPerPage={ITEMS_PER_PAGE}
            withWrapper={false}
          />
        )}

        {/* =========================
          SECCIÓN: EVALUAR ENTREGAS
        ========================== */}
        {active === "evaluar-entregas" && <EvaluarEntregas withWrapper={false} />}

        {/* =========================
          SECCIÓN: CREAR TURNOS
        ========================== */}
        {active === "crear-turnos" && <CreateTurnos withWrapper={false} />}

        {/* =========================
          SECCION: CARGAR USUARIOS
        ========================== */}
        {active === "cargar-usuarios" && <CreateUsers withWrapper={false} />}

        {/* =========================
          SECCIÓN: CONFIGURACIÓN
        ========================== */}
        {active === "config" && <Configuracion withWrapper={false} />}
      </LayoutWrapper>
    </div>
  );
};
