// === Dashboard Profesor ===
// Panel del docente: aprobar/rechazar turnos, gestionar usuarios y crear slots.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/layout/SideBar";
import { LayoutWrapper } from "../components/layout/LayoutWrapper";
import { useAppData } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useLoading } from "../context/LoadingContext";
import { useError } from "../context/ErrorContext";
import { showToast } from "../utils/feedback/toasts";
import { ensureModuleLabel, coincideModulo } from "../utils/moduleMap";

// === Secciones del dashboard ===
import { CreateTurnos } from "./CreateTurnos";
import { EvaluarEntregas } from "./EvaluarEntregas";
import { Configuracion } from "./Configuracion";
import { SolicitudesTurnos } from "./SolicitudesTurnos";
import { UsuariosPendientes } from "./UsuariosPendientes";
import { CreateUsers } from "./CreateUsers";

const ITEMS_PER_PAGE = 5;

export const DashboardProfesor = () => {
  // === Contextos globales ===
  const appData = useAppData();
  const { turnos = [], usuarios = [], loadTurnos, loadEntregas, loadUsuarios } =
    appData || {};
  const { usuario: usuarioActual, token, cerrarSesion } = useAuth();
  const { pushError } = useError();
  const navigate = useNavigate();
  const { isLoading } = useLoading();
  const { showModal } = useModal();

  // === Estado local ===
  const [active, setActive] = useState("solicitudes");

  // === Deducción del módulo del profesor ===
  // ARQUITECTURA: modulo es STRING ENUM - es la fuente primaria de identidad del profesor
  const moduloEtiqueta = useMemo(() => {
    if (!usuarioActual) return null;
    return ensureModuleLabel(usuarioActual.modulo);
  }, [usuarioActual]);


  // === Filtrado de datos por módulo ===
  const turnosDelModulo = useMemo(
    () => {
      if (!turnos || turnos.length === 0) return [];
      if (!moduloEtiqueta) return turnos;
      return turnos.filter((turno) => coincideModulo(turno, moduloEtiqueta));
    },
    [turnos, moduloEtiqueta]
  );

  const usuariosDelModulo = useMemo(
    () => (usuarios || []).filter((obj) => coincideModulo(obj, moduloEtiqueta)),
    [usuarios, moduloEtiqueta]
  );

  // Solo usuarios pendientes (para la sección de aprobación)
  const usuariosPendientesDelModulo = useMemo(
    () =>
      usuariosDelModulo.filter(
        (u) => String(u.estado || u.status || "").toLowerCase() === "pendiente"
      ),
    [usuariosDelModulo]
  );

  // === Carga inicial de datos del módulo ===
  useEffect(() => {
    if (
      !usuarioActual ||
      !token ||
      (usuarioActual?.rol ?? usuarioActual?.role) !== "profesor"
    )
      return;
    (async () => {
      try {
        // Backend filtra automáticamente por módulo del usuario autenticado
        // Los turnos ahora se crean con el modulo correcto del profesor
        const turnosParams = {};
        const usuariosParams = moduloEtiqueta ? { modulo: moduloEtiqueta } : {};

        await Promise.all([
          loadTurnos(turnosParams),
          loadEntregas(),
          loadUsuarios(usuariosParams),
        ]);
      } catch (error) {
        showToast("Error al cargar datos del módulo", "error");
        pushError?.("Fallo al obtener datos del módulo", {
          description: error?.message,
        });
      }
    })();
  }, [
    usuarioActual,
    token,
    moduloEtiqueta,
    loadTurnos,
    loadEntregas,
    loadUsuarios,
    pushError,
  ]);

  // === Manejo de navegación ===
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

  // === Render principal ===
  return (
    <div className="flex min-h-screen bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <SideBar
        items={[
          {
            id: "solicitudes",
            label: "Turnos Pendientes",
            icon: "/icons/calendar-1.png",
          },
          {
            id: "usuarios",
            label: "Usuarios Pendientes",
            icon: "/icons/users-2.png",
          },          
          {
            id: "evaluar-entregas",
            label: "Evaluar Entregables",
            icon: "/icons/briefcase-4.png",
          },
          {
            id: "crear-turnos",
            label: "Crear Turnos",
            icon: "/icons/time_and_date-2.png",
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

      <LayoutWrapper
        as="main"
        className="flex-1 text-[#111827] dark:text-gray-100 transition-colors duration-300"
        maxWidthClass="max-w-6xl"
      >
        {/* =========================
          SECCION: SOLICITUDES DE TURNOS
        ========================== */}
        {active === "solicitudes" && (
          <SolicitudesTurnos
            turnos={turnosDelModulo}
            isLoading={isLoading("turnos")}
            itemsPerPage={ITEMS_PER_PAGE}
            withWrapper={false}
          />
        )}

        {/* =========================
          SECCION: SOLICITUD USUARIOS
        ========================== */}
        {active === "usuarios" && (
            <UsuariosPendientes
            usuarios={usuariosPendientesDelModulo}
            isLoading={isLoading("usuarios")}
            itemsPerPage={ITEMS_PER_PAGE}
            withWrapper={false}
          />
        )}

        {/* =========================
          SECCION: CREAR TURNOS
        ========================== */}
        {active === "crear-turnos" && <CreateTurnos withWrapper={false} />}

        {/* =========================
          SECCION: EVALUAR ENTREGAS
        ========================== */}
        {active === "evaluar-entregas" && <EvaluarEntregas withWrapper={false} />}

        {/* =========================
          SECCION: CARGAR USUARIOS
        ========================== */}
        {active === "cargar-usuarios" && <CreateUsers withWrapper={false} />}

        {/* =========================
          SECCION: CONFIGURACION
        ========================== */}
        {active === "config" && <Configuracion withWrapper={false} />}
      </LayoutWrapper>
    </div>
  );
};
