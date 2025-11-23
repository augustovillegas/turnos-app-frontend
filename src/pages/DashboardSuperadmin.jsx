// === Dashboard Superadmin ===
// Panel general: gestión global de usuarios, turnos y entregas.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/layout/SideBar";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { CreateTurnos } from "./CreateTurnos";
import { Status } from "../components/ui/Status";
import { formatDateForTable } from "../utils/formatDateForTable";
import { useAppData } from "../context/AppContext";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { CardTurno } from "../components/ui/CardTurno";
import { SearchBar } from "../components/ui/SearchBar";
import { EvaluarEntregas } from "./EvaluarEntregas";
import { Configuracion } from "./Configuracion";
import { showToast } from "../utils/feedback/toasts";
import { useModal } from "../context/ModalContext";
import {
  buildTurnoPayloadFromForm,
  formValuesFromTurno,
} from "../utils/turnos/form";
import { useAuth } from "../context/AuthContext";
import { Pagination } from "../components/ui/Pagination";
import { Skeleton } from "../components/ui/Skeleton";
import { useLoading } from "../context/LoadingContext";
import { useError } from "../context/ErrorContext";
import { CreateUsers } from "./CreateUsers";

export const DashboardSuperadmin = () => {
  // --- Contexto global con acceso a todo el sistema ---
  const {
    turnos,
    updateTurno,
    usuarios,
    loadTurnos,
    loadEntregas,
    loadUsuarios,
    approveUsuario: approveUsuarioRemoto,
    updateUsuarioEstado: updateUsuarioEstadoRemoto,
  } = useAppData();
  const navigate = useNavigate();
  const { usuario: usuarioActual, token, cerrarSesion } = useAuth();
  const { showModal } = useModal();
  const { isLoading } = useLoading();
  const turnosLoading = isLoading("turnos");
  const { pushError } = useError();

  // --- Estado local: pestañas y proceso actual ---
  const [active, setActive] = useState("usuarios");
  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingTurno, setProcessingTurno] = useState(null);
  const [processingUsuario, setProcessingUsuario] = useState(null);
  const ITEMS_PER_PAGE = 5;
  const [pageTurnosSolicitados, setPageTurnosSolicitados] = useState(1);
  const [pageUsuariosPendientes, setPageUsuariosPendientes] = useState(1);

  // --- Acciones sobre turnos pendientes a nivel global ---
  const handleAprobarTurno = async (turno) => {
    if (!turno || turno.estado !== "Solicitado") return;
    setProcessingTurno(turno.id);
    try {
      const payload = buildTurnoPayloadFromForm({
        ...formValuesFromTurno(turno),
        review: turno.review,
        comentarios: turno.comentarios || "",
        estado: "Aprobado",
      });
      await updateTurno(turno.id, payload);
      showToast("Turno aprobado correctamente.");
    } catch (error) {
      const message = error?.message || "No se pudo aprobar el turno.";
      showToast(message, "error");
      if (pushError) {
        pushError("Error al aprobar turno.", {
          description: message,
        });
      }
    } finally {
      setProcessingTurno(null);
    }
  };

  // --- Maneja rechazos cuando el turno no continua ---
  const handleRechazarTurno = (turno) => {
    if (!turno || turno.estado !== "Solicitado") return;

    showModal({
      type: "warning",
      title: "Rechazar turno",
      message: `¿Rechazar el turno solicitado para la sala ${turno.sala}?`,

      // Acción ejecutada al confirmar
      onConfirm: async () => {
        setProcessingTurno(turno.id);
        try {
          const payload = buildTurnoPayloadFromForm({
            ...formValuesFromTurno(turno),
            review: turno.review,
            comentarios: turno.comentarios || "",
            estado: "Rechazado",
          });

          await updateTurno(turno.id, payload);
          showToast("Turno rechazado correctamente.");
        } catch (error) {
          const message = error?.message || "No se pudo rechazar el turno.";
          showToast(message, "error");
          if (pushError) {
            pushError("Error al rechazar turno.", {
              description: message,
            });
          }
        } finally {
          setProcessingTurno(null);
        }
      },
    });
  };

  // --- Carga inicial de datos globales ---
  useEffect(() => {
    if (!usuarioActual || !token) return;
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
  }, [usuarioActual, token, loadTurnos, loadEntregas, loadUsuarios, pushError]);
  // --- Operaciones sobre usuarios desde la vista global ---
  const handleAprobarUsuario = (usuario) => {
    if (!usuario?.id) return;
    const nombre = usuario.nombre || usuario.email || "este usuario";

    showModal({
      type: "warning",
      title: "Aprobar usuario",
      message: `¿Confirmás la aprobación de ${nombre}?`,
      onConfirm: async () => {
        setProcessingUsuario(usuario.id);
        try {
          await approveUsuarioRemoto(usuario.id);
          showToast("Usuario aprobado.");
        } catch (error) {
          const message = error?.message || "No se pudo aprobar al usuario.";
          showToast(message, "error");
          if (pushError) {
            pushError("Error al aprobar usuario.", {
              description: message,
            });
          }
        } finally {
          setProcessingUsuario(null);
        }
      },
    });
  };

  const handleRechazarUsuario = (usuario) => {
    if (!usuario?.id) return;
    const nombre = usuario.nombre || usuario.email || "este usuario";

    showModal({
      type: "warning",
      title: "Rechazar usuario",
      message: `¿Confirmás el rechazo de ${nombre}?`,
      onConfirm: async () => {
        setProcessingUsuario(usuario.id);
        try {
          await updateUsuarioEstadoRemoto(usuario.id, "Rechazado");
          showToast("Usuario rechazado.");
        } catch (error) {
          const message = error?.message || "No se pudo rechazar al usuario.";
          showToast(message, "error");
          if (pushError) {
            pushError("Error al rechazar usuario.", {
              description: message,
            });
          }
        } finally {
          setProcessingUsuario(null);
        }
      },
    });
  };

  // --- Usuarios esperando aprobación ---
  const usuariosCollection = Array.isArray(usuarios) ? usuarios : [];
  const usuariosPendientes = usuariosCollection.filter((u) => {
    const estado = String(u?.estado || u?.status || "").toLowerCase();
    return estado === "pendiente";
  });
  const [usuariosPendientesBuscados, setUsuariosPendientesBuscados] =
    useState(usuariosPendientes);

  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  // --- Turnos solicitados a nivel general ---
  const turnosCollection = Array.isArray(turnos) ? turnos : [];
  const turnosSolicitados = aplicarFiltro(
    turnosCollection.filter(
      (t) => String(t?.estado || "").toLowerCase() === "solicitado"
    )
  );
  const [turnosSolicitadosBuscados, setTurnosSolicitadosBuscados] =
    useState(turnosSolicitados);
  const totalTurnosSolicitados = turnosSolicitadosBuscados.length;
  const totalUsuariosPendientes = usuariosPendientesBuscados.length;

  useEffect(() => {
    setPageTurnosSolicitados(1);
  }, [filtroReview]);

  useEffect(() => {
    setTurnosSolicitadosBuscados(turnosSolicitados);
  }, [turnosSolicitados]);

  useEffect(() => {
    setUsuariosPendientesBuscados(usuariosPendientes);
  }, [usuariosPendientes]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((totalTurnosSolicitados || 0) / ITEMS_PER_PAGE)
    );
    setPageTurnosSolicitados((prev) => {
      if (totalTurnosSolicitados === 0) return 1;
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalTurnosSolicitados, ITEMS_PER_PAGE]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((totalUsuariosPendientes || 0) / ITEMS_PER_PAGE)
    );
    setPageUsuariosPendientes((prev) => {
      if (totalUsuariosPendientes === 0) return 1;
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalUsuariosPendientes, ITEMS_PER_PAGE]);

  // --- Paginacion de turnos para el superadmin ---
  const paginatedTurnosSolicitados = useMemo(() => {
    const totalPages =
      Math.ceil((totalTurnosSolicitados || 0) / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(
      Math.max(pageTurnosSolicitados, 1),
      totalPages
    );
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: turnosSolicitadosBuscados.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalTurnosSolicitados,
      totalPages,
      currentPage,
    };
  }, [
    turnosSolicitadosBuscados,
    totalTurnosSolicitados,
    pageTurnosSolicitados,
    ITEMS_PER_PAGE,
  ]);

  // --- Paginacion de usuarios pendientes ---
  const paginatedUsuariosPendientes = useMemo(() => {
    const totalPages =
      Math.ceil((totalUsuariosPendientes || 0) / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(
      Math.max(pageUsuariosPendientes, 1),
      totalPages
    );
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: usuariosPendientesBuscados.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalUsuariosPendientes,
      totalPages,
      currentPage,
    };
  }, [
    usuariosPendientesBuscados,
    totalUsuariosPendientes,
    pageUsuariosPendientes,
    ITEMS_PER_PAGE,
  ]);
  const isTurnosSectionLoading = turnosLoading;
  const hasTurnosSolicitados =
    paginatedTurnosSolicitados.totalItems > 0 &&
    paginatedTurnosSolicitados.items.length > 0;
  const isUsuariosSectionLoading = isLoading("usuarios");
  const hasUsuariosPendientes =
    paginatedUsuariosPendientes.totalItems > 0 &&
    paginatedUsuariosPendientes.items.length > 0;

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
          SECCIÓN: SOLICITUDES
        ========================== */}
        {active === "turnos" && (
          <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
            {/* 🎨 Ajuste visual: Se reemplaza el fragmento <> por un contenedor alineado con padding y colores consistentes */}
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
              {/* 🎨 Ajuste visual: Se mantiene el mismo estilo de encabezado que en los dashboards de alumno/profesor */}
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-3xl font-bold text-[#1E3A8A] transition-colors duration-300 dark:text-[#93C5FD]">
                  Solicitudes de Turnos
                </h2>
              </div>

              <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

              {/* Tabla Desktop */}
              <div className="hidden sm:block">
                {isTurnosSectionLoading ? (
                  <div className="space-y-3 py-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} height="2.75rem" />
                    ))}
                  </div>
                ) : (
                  <Table
                    columns={[
                      "Review",
                      "Fecha",
                      "Horario",
                      "Sala",
                      "Zoom",
                      "Estado",
                      "Accion",
                    ]}
                    data={paginatedTurnosSolicitados.items || []}
                    minWidth="min-w-[680px]" // 🎨 Ajuste visual: mantiene consistencia con tablas del dashboard alumno
                    containerClass="px-4"
                    renderRow={(t) => (
                      <>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                          {t.review}
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                          {formatDateForTable(t.fecha)}
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                          {t.horario}
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                          {t.sala}
                        </td>
                        <td className="border p-2 text-center dark:border-[#333]">
                          {t.zoomLink && (
                            <a
                              href={t.zoomLink}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <img
                                src="/icons/video_-2.png"
                                alt="Zoom"
                                className="mx-auto h-5 w-5 hover:opacity-80"
                              />
                            </a>
                          )}
                        </td>
                        <td className="border p-2 text-center dark:border-[#333]">
                          <Status status={t.estado} />
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                          {t.estado === "Solicitado" && (
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                variant="success"
                                className="py-1"
                                onClick={() => handleAprobarTurno(t)}
                                disabled={
                                  isTurnosSectionLoading ||
                                  processingTurno === t.id
                                }
                              >
                                Aprobar
                              </Button>
                              <Button
                                variant="danger"
                                className="py-1"
                                onClick={() => handleRechazarTurno(t)}
                                disabled={
                                  isTurnosSectionLoading ||
                                  processingTurno === t.id
                                }
                              >
                                Rechazar
                              </Button>
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  />
                )}
              </div>

              {/* Tarjetas Mobile */}
              <div className="mt-4 space-y-4 px-2 sm:hidden">
                {isTurnosSectionLoading ? (
                  <div className="space-y-3 py-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} height="4rem" />
                    ))}
                  </div>
                ) : hasTurnosSolicitados ? (
                  paginatedTurnosSolicitados.items.map((t) => (
                    <CardTurno
                      key={t.id}
                      turno={t}
                      onAprobar={() => handleAprobarTurno(t)}
                      onRechazar={() => handleRechazarTurno(t)}
                      disabled={
                        isTurnosSectionLoading || processingTurno === t.id
                      }
                    />
                  ))
                ) : (
                  <div className="rounded-md border-2 border-[#111827]/40 bg-white p-6 text-center shadow-md dark:border-[#333] dark:bg-[#1E1E1E]">
                    <p className="text-sm font-mono text-gray-100 dark:text-gray-300">
                      No hay registros.
                    </p>
                  </div>
                )}
              </div>

              {/* 🎨 Ajuste visual: Espaciado y paginación alineados con el resto de dashboards */}
              {!isTurnosSectionLoading && (
                <Pagination
                  totalItems={paginatedTurnosSolicitados.totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={paginatedTurnosSolicitados.currentPage}
                  onPageChange={setPageTurnosSolicitados}
                />
              )}
            </div>
          </div>
        )}
        {/* =========================
          SECCIÓN: GESTIÓN USUARIOS
        ========================== */}
        {active === "usuarios" && (
          <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
            {/* 🎨 Ajuste visual: contenedor principal alineado con padding consistente */}
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
              {/* 🎨 Título unificado */}
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h2 className="text-3xl font-bold text-[#1E3A8A] transition-colors duration-300 dark:text-[#93C5FD]">
                  Usuarios Pendientes
                </h2>
              </div>

              <SearchBar
                data={usuariosPendientes}
                fields={["nombre", "rol", "estado"]}
                placeholder="Buscar usuarios pendientes"
                onSearch={(results) => {
                  setUsuariosPendientesBuscados(results);
                  setPageUsuariosPendientes(1);
                }}
              />

              {/* Tabla Desktop */}
              <div className="hidden sm:block">
                {isUsuariosSectionLoading ? (
                  <div className="space-y-3 py-6">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} height="2.75rem" />
                    ))}
                  </div>
                ) : (
                  <Table
                    columns={["Nombre", "Rol", "Estado", "Accion"]}
                    data={paginatedUsuariosPendientes.items || []}
                    minWidth="min-w-[680px]"
                    containerClass="px-4"
                    renderRow={(u) => (
                      <>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                          {u.nombre}
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                          {u.rol}
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                          <Status status={u.estado} />
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="success"
                              className="py-1"
                              onClick={() => handleAprobarUsuario(u)}
                              disabled={
                                isUsuariosSectionLoading ||
                                processingUsuario === u.id
                              }
                            >
                              Aprobar
                            </Button>
                            <Button
                              variant="danger"
                              className="py-1"
                              onClick={() => handleRechazarUsuario(u)}
                              disabled={
                                isUsuariosSectionLoading ||
                                processingUsuario === u.id
                              }
                            >
                              Rechazar
                            </Button>
                          </div>
                        </td>
                      </>
                    )}
                  />
                )}
              </div>

              {/* Tarjetas Mobile */}
              <div className="mt-4 space-y-4 px-2 sm:hidden">
                {isUsuariosSectionLoading ? (
                  <div className="space-y-3 py-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} height="4.5rem" />
                    ))}
                  </div>
                ) : hasUsuariosPendientes ? (
                  paginatedUsuariosPendientes.items.map((u, idx) => (
                    <div
                      key={u.id || `${u.nombre}-${idx}`}
                      className="space-y-2 rounded-md border-2 border-[#111827] bg-white p-4 shadow-md dark:border-[#333] dark:bg-[#1E1E1E]"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-base font-semibold text-[#1E3A8A] dark:text-[#93C5FD]">
                          {u.nombre}
                        </h3>
                        <Status status={u.estado} />
                      </div>
                      <p className="text-sm text-[#111827] dark:text-gray-200">
                        <strong>Rol:</strong> {u.rol}
                      </p>
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="success"
                          className="w-full py-1"
                          onClick={() => handleAprobarUsuario(u)}
                          disabled={
                            isUsuariosSectionLoading ||
                            processingUsuario === u.id
                          }
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="danger"
                          className="w-full py-1"
                          onClick={() => handleRechazarUsuario(u)}
                          disabled={
                            isUsuariosSectionLoading ||
                            processingUsuario === u.id
                          }
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border-2 border-[#111827]/40 bg-white p-6 text-center shadow-md dark:border-[#333] dark:bg-[#1E1E1E]">
                    <p className="text-sm font-mono text-gray-100 dark:text-gray-300">
                      No hay registros.
                    </p>
                  </div>
                )}
              </div>

              {/* 🎨 Paginación alineada visualmente */}
              {!isUsuariosSectionLoading && (
                <Pagination
                  totalItems={paginatedUsuariosPendientes.totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={paginatedUsuariosPendientes.currentPage}
                  onPageChange={setPageUsuariosPendientes}
                />
              )}
            </div>
          </div>
        )}

        {/* =========================
          SECCIÓN: CREAR TURNOS
        ========================== */}
        {active === "crear-turnos" && <CreateTurnos />}

        {/* =========================
          SECCIÓN: EVALUAR ENTREGAS
        ========================== */}
        {active === "evaluar-entregas" && <EvaluarEntregas />}

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

