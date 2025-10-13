// === Dashboard Superadmin ===
// Panel general: gestion global de usuarios, turnos y entregas.
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
import { win98Alert } from "../utils/feedback/alerts";
import {
  buildTurnoPayloadFromForm,
  formValuesFromTurno,
} from "../utils/turnos/form";
import { useAuth } from "../context/AuthContext";
import { Pagination } from "../components/ui/Pagination";

export const DashboardSuperadmin = () => {
  // --- Contexto global con acceso a todo el sistema ---
  const {
    turnos,
    updateTurno,
    turnosLoading,
    usuarios,
    setUsuarios,
    loadTurnos,
    loadEntregas,
    loadUsuarios,
  } = useAppData();
  const { user, token } = useAuth();

  // --- Estado local: pesta�as y proceso actual ---
  const [active, setActive] = useState("usuarios");
  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingTurno, setProcessingTurno] = useState(null);
  const ITEMS_PER_PAGE = 5;
  const [pageTurnosSolicitados, setPageTurnosSolicitados] = useState(1);
  const [pageUsuariosPendientes, setPageUsuariosPendientes] = useState(1);

  // --- Acciones sobre turnos pendientes a nivel global ---
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

  // --- Maneja rechazos cuando el turno no continua ---
  const rechazarTurno = async (turno) => {
    if (!turno || turno.estado !== "Solicitado") return;
    const result = await win98Alert({
      title: "Rechazar turno",
      text: `¿Rechazar el turno solicitado para la sala ${turno.sala}?`,
      swalIcon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, rechazar",
      cancelButtonText: "Volver",
    });
    if (!result.isConfirmed) return;

    setProcessingTurno(turno.id);
    try {
      const payload = buildTurnoPayloadFromForm({
        ...formValuesFromTurno(turno),
        review: turno.review,
        comentarios: turno.comentarios || "",
        estado: "Rechazado",
      });
      await updateTurno(turno.id, payload);
      showToast("Turno rechazado.");
    } catch (error) {
      showToast(error.message || "No se pudo rechazar el turno.", "error");
    } finally {
      setProcessingTurno(null);
    }
  };

  // --- Carga inicial de datos globales ---
  useEffect(() => {
    if (!user || !token) return;
    if (user.role !== "superadmin") return;

    const fetchData = async () => {
      try {
        await Promise.all([loadTurnos(), loadEntregas(), loadUsuarios()]);
      } catch (error) {
        console.error("Error al cargar los datos globales", error);
        showToast("No se pudieron cargar los datos generales.", "error");
      }
    };

    fetchData();
  }, [user, token, loadTurnos, loadEntregas, loadUsuarios]);
  // --- Operaciones sobre usuarios desde la vista global ---
  const aprobarUsuario = (index) => {
    const nuevos = [...usuarios];
    nuevos[index].estado = "Aprobado";
    setUsuarios(nuevos);
    showToast("Usuario aprobado.");
  };

  // --- Usuarios esperando aprobacion ---
  const usuariosPendientes = usuarios.filter((u) => u.estado === "Pendiente");
  const [usuariosPendientesBuscados, setUsuariosPendientesBuscados] = useState(usuariosPendientes);

  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  // --- Turnos solicitados a nivel general ---
  const turnosSolicitados = aplicarFiltro(
    turnos.filter((t) => t.estado === "Solicitado")
  );
  const [turnosSolicitadosBuscados, setTurnosSolicitadosBuscados] = useState(turnosSolicitados);
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
            SECCIÓN: TURNOS SOLICITADOS
        ========================== */}
        {active === "turnos" && (
          <>
            <h2 className="mb-6 text-2xl font-bold text-[#1E3A8A] transition-colors duration-300 dark:text-[#93C5FD]">
              Solicitudes de Turnos
            </h2>

            <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

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
                renderRow={(t) => (
                  <>
                    <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                      {t.review}
                    </td>
                    <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                      {t.fecha}
                    </td>
                    <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                      {t.horario}
                    </td>
                    <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                      {t.sala}
                    </td>
                    <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                      {t.zoomLink && (
                        <a href={t.zoomLink} target="_blank" rel="noreferrer">
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
                            onClick={() => aprobarTurno(t)}
                            disabled={turnosLoading || processingTurno === t.id}
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="danger"
                            className="py-1"
                            onClick={() => rechazarTurno(t)}
                            disabled={turnosLoading || processingTurno === t.id}
                          >
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </td>
                  </>
                )}
              />
            </div>

            <div className="mt-4 block space-y-4 px-2 sm:hidden">
              {paginatedTurnosSolicitados.totalItems === 0 ? (
                <p className="text-sm text-gray-100 dark:text-gray-300">
                  No hay solicitudes pendientes.
                </p>
              ) : (
                paginatedTurnosSolicitados.items.map((t) => (
                  <CardTurno
                    key={t.id}
                    turno={t}
                    onAprobar={() => aprobarTurno(t)}
                    onRechazar={() => rechazarTurno(t)}
                    disabled={turnosLoading || processingTurno === t.id}
                  />
                ))
              )}
            </div>

            <Pagination
              totalItems={paginatedTurnosSolicitados.totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              currentPage={paginatedTurnosSolicitados.currentPage}
              onPageChange={setPageTurnosSolicitados}
            />
          </>
        )}

        {/* =========================
            SECCIÓN: GESTIÓN USUARIOS
        ========================== */}
        {active === "usuarios" && (
          <>
            <h2 className="mb-6 text-2xl font-bold text-[#1E3A8A] transition-colors duration-300 dark:text-[#93C5FD]">
              Usuarios Pendientes
            </h2>

                        <SearchBar
              data={usuariosPendientesBuscados}
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
                            onClick={() => aprobarUsuario(indexReal)}
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="danger"
                            className="py-1"
                            onClick={() => {
                              const nuevos = [...usuarios];
                              nuevos[indexReal].estado = "Rechazado";
                              setUsuarios(nuevos);
                            }}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </td>
                    </>
                  );
                }}
              />
            </div>

            <div className="mt-4 space-y-4 px-2 sm:hidden">
              {paginatedUsuariosPendientes.totalItems === 0 ? (
                <p className="text-sm text-gray-100 dark:text-gray-300">
                  No hay usuarios pendientes por aprobar.
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
                      <div className="grid grid-cols-1 gap-2">
                        <Button
                          variant="success"
                          className="w-full py-1"
                          onClick={() => aprobarUsuario(indexReal)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="danger"
                          className="w-full py-1"
                          onClick={() => {
                            const nuevos = [...usuarios];
                            nuevos[indexReal].estado = "Rechazado";
                            setUsuarios(nuevos);
                          }}
                        >
                          Rechazar
                        </Button>
                      </div>
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
