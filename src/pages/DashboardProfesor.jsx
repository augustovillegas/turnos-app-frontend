// === Dashboard Profesor ===
// Panel del docente: aprobar/rechazar turnos, gestionar usuarios y crear slots.
import { useEffect, useMemo, useState } from "react";
import { SideBar } from "../components/layout/SideBar";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { CreateTurnos } from "./CreateTurnos";
import { Status } from "../components/ui/Status";
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

export const DashboardProfesor = () => {
  // --- Contexto y permisos del profesor ---
  // App context
  const {
    turnos,
    updateTurno,
    turnosLoading,
    usuarios,
    setUsuarios,
    loadTurnos,
    loadEntregas,
  } = useAppData();
  const { user, token } = useAuth();
  const { showModal } = useModal();
  const { isLoading } = useLoading();

  // --- Estado local: panel activo y operacion actual ---
  const [active, setActive] = useState("solicitudes");
  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingTurno, setProcessingTurno] = useState(null);
  const ITEMS_PER_PAGE = 5;
  const [pageSolicitudes, setPageSolicitudes] = useState(1);
  const [pageUsuariosPendientes, setPageUsuariosPendientes] = useState(1);

  // ---- Funciones de gestión de turnos ----
  // --- Acciones sobre turnos solicitados ---
  const aprobarTurno = async (turno) => {
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
      showToast(error.message || "No se pudo aprobar el turno.", "error");
    } finally {
      setProcessingTurno(null);
    }
  };

  // --- Maneja rechazos explicitos de solicitudes ---
  const rechazarTurno = (turno) => {
    if (!turno || turno.estado !== "Solicitado") return;

    showModal({
      type: "warning",
      title: "Rechazar turno",
      message: `¿Confirmás el rechazo del turno para la sala ${turno.sala}?`,

      // Acción que se ejecuta al confirmar
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
          showToast(error.message || "No se pudo rechazar el turno.", "error");
        } finally {
          setProcessingTurno(null);
        }
      },
    });
  };

  // ---- Gestión de usuarios ----
  // --- Operaciones de gestion sobre usuarios pendientes ---
  const aprobarUsuario = (index) => {
    const nuevos = [...usuarios];
    nuevos[index].estado = "Aprobado";
    setUsuarios(nuevos);
  };

  // --- Derivaciones: usuarios pendientes a aprobar ---
  const usuariosPendientes = usuarios.filter((u) => u.estado === "Pendiente");

  // ---- Filtro por review ----
  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  // --- Turnos en estado solicitado filtrados segun la vista ---
  const turnosSolicitados = aplicarFiltro(
    turnos.filter((t) => t.estado === "Solicitado")
  );
  const [turnosSolicitadosBuscados, setTurnosSolicitadosBuscados] =
    useState(turnosSolicitados);
  const [usuariosPendientesBuscados, setUsuariosPendientesBuscados] =
    useState(usuariosPendientes);
  const totalSolicitudes = turnosSolicitadosBuscados.length;
  const totalUsuariosPendientes = usuariosPendientesBuscados.length;

  useEffect(() => {
    setPageSolicitudes(1);
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
      Math.ceil((totalSolicitudes || 0) / ITEMS_PER_PAGE)
    );
    setPageSolicitudes((prev) => {
      if (totalSolicitudes === 0) return 1;
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalSolicitudes, ITEMS_PER_PAGE]);

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

  // --- Paginacion de solicitudes para tableros desktop/mobile ---
  const paginatedTurnosSolicitados = useMemo(() => {
    const totalPages = Math.ceil((totalSolicitudes || 0) / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(Math.max(pageSolicitudes, 1), totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: turnosSolicitadosBuscados.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalSolicitudes,
      totalPages,
      currentPage,
    };
  }, [
    turnosSolicitadosBuscados,
    totalSolicitudes,
    pageSolicitudes,
    ITEMS_PER_PAGE,
  ]);

  // --- Paginacion de usuarios a aprobar ---
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

  // --- Carga inicial de datos del modulo correspondiente ---
  useEffect(() => {
    if (!user || !token) return;
    if (user.role !== "profesor") return;

    const modulo = user.cohort ?? user.modulo;
    const turnosParams = modulo ? { modulo } : {};

    const fetchData = async () => {
      try {
        await Promise.all([
          loadTurnos(turnosParams),
          loadEntregas(turnosParams),
        ]);
      } catch (error) {
        console.error("Error al cargar los datos del profesor", error);
        showToast("No se pudo cargar la informacion del modulo.", "error");
      }
    };

    fetchData();
  }, [user, token, loadTurnos, loadEntregas]);

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
        onSelect={setActive}
      />

      <div className="flex-1 p-6">
        {/* =========================
            SECCIÓN: SOLICITUDES
        ========================== */}
        {active === "solicitudes" && (
          <>
            <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6">
              Solicitudes de Turnos
            </h2>

            <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

            {(turnosLoading || isLoading("turnos")) && (
              <div className="flex flex-col gap-2 my-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} height="1.25rem" />
                ))}
              </div>
            )}

            <SearchBar
              data={turnosSolicitados}
              fields={["sala", "fecha", "horario", "estado", "review"]}
              placeholder="Buscar solicitudes"
              onSearch={(results) => {
                setTurnosSolicitadosBuscados(results);
                setPageSolicitudes(1);
              }}
            />
            {/* ---- Desktop (tabla) ---- */}
            <div className="hidden sm:block">
              <Table
                columns={[
                  "Review",
                  "Fecha",
                  "Horario",
                  "Sala",
                  "Zoom",
                  "Estado",
                  "Acción",
                ]}
                data={paginatedTurnosSolicitados.items}
                renderRow={(t) => {
                  return (
                    <>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                        {t.review}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                        {t.fecha}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                        {t.horario}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                        {t.sala}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333]">
                        {t.zoomLink && (
                          <a href={t.zoomLink} target="_blank" rel="noreferrer">
                            <img
                              src="/icons/video_-2.png"
                              alt="Zoom"
                              className="w-5 h-5 mx-auto hover:opacity-80"
                            />
                          </a>
                        )}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333]">
                        <Status status={t.estado} />
                      </td>
                      <td className="border p-2 text-center dark:border-[#333]">
                        {t.estado === "Solicitado" && (
                          <div className="flex justify-center gap-2">
                            <Button
                              variant="success"
                              className="py-1"
                              onClick={() => aprobarTurno(t)}
                              disabled={
                                turnosLoading || processingTurno === t.id
                              }
                            >
                              Aprobar
                            </Button>
                            <Button
                              variant="danger"
                              className="py-1"
                              onClick={() => rechazarTurno(t)}
                              disabled={
                                turnosLoading || processingTurno === t.id
                              }
                            >
                              Rechazar
                            </Button>
                          </div>
                        )}
                      </td>
                    </>
                  );
                }}
              />
            </div>

            {/* ---- Mobile (tarjetas) ---- */}
            <div className="block sm:hidden space-y-4 mt-4 px-2">
              {paginatedTurnosSolicitados.items.map((t) => (
                <CardTurno
                  key={t.id}
                  turno={t}
                  onAprobar={() => aprobarTurno(t)}
                  onRechazar={() => rechazarTurno(t)}
                  disabled={turnosLoading || processingTurno === t.id}
                />
              ))}
            </div>

            <Pagination
              totalItems={paginatedTurnosSolicitados.totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={paginatedTurnosSolicitados.currentPage}
              onPageChange={setPageSolicitudes}
            />
          </>
        )}

        {/* =========================
            SECCIÓN: SOLICITUD ALUMNOS
        ========================== */}
        {active === "usuarios" && (
          <>
            <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6">
              Usuarios Pendientes
            </h2>

            <SearchBar
              data={usuariosPendientes}
              fields={["nombre", "rol", "estado"]}
              placeholder="Buscar usuarios pendientes"
              onSearch={(results) => {
                setUsuariosPendientesBuscados(results);
                setPageUsuariosPendientes(1);
              }}
            />

            <div className="hidden sm:block">
              <Table
                columns={["Nombre", "Rol", "Estado", "Acción"]}
                data={paginatedUsuariosPendientes.items}
                renderRow={(u) => {
                  const indexReal = usuarios.findIndex((x) => x === u);
                  return (
                    <>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                        {u.nombre}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                        {u.rol}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333]">
                        <Status status={u.estado} />
                      </td>
                      <td className="border p-2 text-center dark:border-[#333]">
                        <Button
                          variant="success"
                          className="py-1"
                          onClick={() => aprobarUsuario(indexReal)}
                        >
                          Aprobar usuario
                        </Button>
                      </td>
                    </>
                  );
                }}
              />
            </div>

            <div className="mt-4 space-y-4 px-2 sm:hidden">
              {paginatedUsuariosPendientes.totalItems === 0 ? (
                <p className="text-sm text-gray-100 dark:text-gray-300">
                  No hay usuarios pendientes de aprobación.
                </p>
              ) : (
                paginatedUsuariosPendientes.items.map((u, idx) => {
                  const indexReal = usuarios.findIndex((x) => x === u);
                  return (
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
                      <Button
                        variant="success"
                        className="w-full py-1"
                        onClick={() => aprobarUsuario(indexReal)}
                      >
                        Aprobar usuario
                      </Button>
                    </div>
                  );
                })
              )}
            </div>

            <Pagination
              totalItems={paginatedUsuariosPendientes.totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={paginatedUsuariosPendientes.currentPage}
              onPageChange={setPageUsuariosPendientes}
            />
          </>
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
            SECCIÓN: CONFIGURACION
        ========================== */}
        {active === "config" && <Configuracion />}
      </div>
    </div>
  );
};
