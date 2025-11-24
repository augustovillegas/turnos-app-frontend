// === Dashboard Superadmin ===
// Panel general: gestión global de usuarios, turnos y entregas.
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/layout/SideBar";
import { CreateTurnos } from "./CreateTurnos";
import { useAppData } from "../context/AppContext";
import { EvaluarEntregas } from "./EvaluarEntregas";
import { Configuracion } from "./Configuracion";
import { showToast } from "../utils/feedback/toasts";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";
import { useError } from "../context/ErrorContext";
import { CreateUsers } from "./CreateUsers";
import { SolicitudesTurnos } from "./SolicitudesTurnos";
import { UsuariosPendientes } from "./UsuariosPendientes";

export const DashboardSuperadmin = () => {
  // --- Contexto global con acceso a todo el sistema ---
  const {
    turnos,
    usuarios,
    loadTurnos,
    loadEntregas,
    loadUsuarios,
  } = useAppData();
  const navigate = useNavigate();
  const { usuario: usuarioActual, cerrarSesion } = useAuth();
  const { isLoading } = useLoading();
  const { pushError } = useError();

  // --- Estado local: solo la pestaña activa ---
  const [active, setActive] = useState("usuarios");
  const ITEMS_PER_PAGE = 5;

  // --- Carga inicial de datos globales ---
  useEffect(() => {
    if (!usuarioActual) return;
    if (usuarioActual.role !== "superadmin") return;

    const fetchData = async () => {
      try {
        await Promise.all([loadTurnos(), loadEntregas(), loadUsuarios()]);
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
      cerrarSesion();
      showToast("Sesión cerrada correctamente.", "info");
      navigate("/", { replace: true });
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
        ]}
        active={active}
        onSelect={handleSidebarSelect}
      />

      <div className="flex-1 p-6">
        {/* =========================
          SECCIÓN: GESTIÓN USUARIOS
        ========================== */}
        {active === "usuarios" && (
          <UsuariosPendientes
            usuarios={usuarios}
            isLoading={isLoading("usuarios")}
            itemsPerPage={ITEMS_PER_PAGE}
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
          />
        )}

        {/* =========================
          SECCIÓN: EVALUAR ENTREGAS
        ========================== */}
        {active === "evaluar-entregas" && <EvaluarEntregas />}

        {/* =========================
          SECCIÓN: CREAR TURNOS
        ========================== */}
        {active === "crear-turnos" && <CreateTurnos />}

        {/* =========================
          SECCION: CARGAR USUARIOS
        ========================== */}
        {active === "cargar-usuarios" && <CreateUsers />}

        {/* =========================
          SECCIÓN: CONFIGURACIÓN
        ========================== */}
        {active === "config" && <Configuracion />}
      </div>
    </div>
  );
};
