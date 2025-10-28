// === Dashboard Profesor ===
// Panel del docente: aprobar/rechazar turnos, gestionar usuarios y crear slots.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { useError } from "../context/ErrorContext";

export const DashboardProfesor = () => {
  // --- Contexto y permisos del profesor ---
  // App context
  const {
    turnos,
    updateTurno,
    turnosLoading,
    usuarios,
    loadTurnos,
    loadEntregas,
    loadUsuarios,
    approveUsuario: approveUsuarioRemoto,
  } = useAppData();
  const navigate = useNavigate();
  const { usuario: usuarioActual, token, cerrarSesion } = useAuth();
  const { showModal } = useModal();
  const { isLoading } = useLoading();
  const { pushError } = useError();

  const moduloActual = useMemo(() => {
    if (!usuarioActual) return null;
    const candidates = [
      usuarioActual.cohort,
      usuarioActual.cohorte,
      usuarioActual.modulo,
      usuarioActual.module,
    ];
    const found = candidates.find(
      (candidate) =>
        candidate !== undefined &&
        candidate !== null &&
        String(candidate).trim() !== ""
    );
    return found ? String(found).trim() : null;
  }, [usuarioActual]);
  const moduloActualNormalized = moduloActual
    ? moduloActual.toLowerCase()
    : null;

  const moduloCoincide = (value) => {
    if (!moduloActualNormalized) return true;
    if (value === undefined || value === null) return false;
    if (Array.isArray(value)) {
      return value.some((item) => moduloCoincide(item));
    }
    if (typeof value === "object") {
      const nestedCandidates = [
        value.nombre,
        value.name,
        value.id,
        value._id,
        value.slug,
        value.codigo,
      ];
      return nestedCandidates.some((candidate) => moduloCoincide(candidate));
    }
    const normalized = String(value).trim().toLowerCase();
    return normalized === moduloActualNormalized;
  };

  const turnoPerteneceAlModulo = (turno) => {
    if (!moduloActualNormalized) return true;
    if (!turno || typeof turno !== "object") return false;
    const candidates = [
      turno.modulo,
      turno.module,
      turno.cohort,
      turno.cohorte,
      turno.moduloId,
      turno.cohortId,
    ];
    return candidates.some(moduloCoincide);
  };

  const usuarioPerteneceAlModulo = (usuario) => {
    if (!moduloActualNormalized) return true;
    if (!usuario || typeof usuario !== "object") return false;
    const candidates = [
      usuario.modulo,
      usuario.module,
      usuario.cohort,
      usuario.cohorte,
      usuario.moduloId,
      usuario.cohortId,
      usuario?.datos?.modulo,
      usuario?.datos?.cohort,
    ];
    return candidates.some(moduloCoincide);
  };

  // --- Estado local: panel activo y operacion actual ---
  const [active, setActive] = useState("solicitudes");
  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingTurno, setProcessingTurno] = useState(null);
  const [processingUsuario, setProcessingUsuario] = useState(null);
  const ITEMS_PER_PAGE = 5;
  const [pageSolicitudes, setPageSolicitudes] = useState(1);
  const [pageUsuariosPendientes, setPageUsuariosPendientes] = useState(1);

  // ---- Funciones de gestion de turnos ----
  // --- Acciones sobre turnos solicitados ---
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

  // --- Maneja rechazos explicitos de solicitudes ---
  const handleRechazarTurno = (turno) => {
    if (!turno || turno.estado !== "Solicitado") return;

    showModal({
      type: "warning",
      title: "Rechazar turno",
      message: `Confirmas el rechazo del turno para la sala ${turno.sala}?`,

      // Accion que se ejecuta al confirmar
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

  // ---- Gestion de usuarios ----
  // --- Operaciones de gestion sobre usuarios pendientes ---
  const handleAprobarUsuario = (usuario) => {
    if (!usuario?.id) return;

    const nombre = usuario.nombre || usuario.email || "este usuario";
    showModal({
      type: "warning",
      title: "Aprobar usuario",
      message: `Confirmas la aprobacion de ${nombre}?`,
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

  // --- Derivaciones: usuarios pendientes a aprobar ---
  const turnosCollection = Array.isArray(turnos) ? turnos : [];
  const usuariosCollection = Array.isArray(usuarios) ? usuarios : [];

  const turnosSolicitados = turnosCollection.filter((t) => {
    const estado = String(t?.estado || "").toLowerCase();
    return estado === "solicitado" && turnoPerteneceAlModulo(t);
  });

  const usuariosPendientes = usuariosCollection.filter((u) => {
    const estado = String(u?.estado || u?.status || "").toLowerCase();
    return estado === "pendiente" && usuarioPerteneceAlModulo(u);
  });

  // ---- Filtro por review ----
  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  // --- Turnos en estado solicitado filtrados segun la vista ---
  const turnosSolicitadosFiltrados = aplicarFiltro(turnosSolicitados);
  const [turnosSolicitadosBuscados, setTurnosSolicitadosBuscados] = useState(
    turnosSolicitadosFiltrados
  );
  const [usuariosPendientesBuscados, setUsuariosPendientesBuscados] =
    useState(usuariosPendientes);
  const totalSolicitudes = turnosSolicitadosBuscados.length;
  const totalUsuariosPendientes = usuariosPendientesBuscados.length;

  useEffect(() => {
    setPageSolicitudes(1);
  }, [filtroReview]);

  useEffect(() => {
    setTurnosSolicitadosBuscados(turnosSolicitadosFiltrados);
  }, [turnosSolicitadosFiltrados]);

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
  const isTurnosSectionLoading = turnosLoading || isLoading("turnos");
  const hasSolicitudes =
    paginatedTurnosSolicitados.totalItems > 0 &&
    paginatedTurnosSolicitados.items.length > 0;
  const isUsuariosSectionLoading = isLoading("usuarios");
  const hasUsuariosPendientes =
    paginatedUsuariosPendientes.totalItems > 0 &&
    paginatedUsuariosPendientes.items.length > 0;

  // --- Carga inicial de datos del modulo correspondiente ---
  useEffect(() => {
    if (!usuarioActual || !token) return;
    if (usuarioActual.role !== "profesor") return;

    const fetchData = async () => {
      try {
        await Promise.all([loadTurnos(), loadEntregas(), loadUsuarios()]);
      } catch (error) {
        console.error("Error al cargar los datos del profesor", error);
        showToast("No se pudo cargar la informacion del modulo.", "error");
        if (pushError) {
          pushError("Error al cargar datos del modulo.", {
            description:
              error?.message ||
              "Fallo inesperado al obtener turnos, entregas y usuarios.",
          });
        }
      }
    };

    fetchData();
  }, [usuarioActual, token, loadTurnos, loadEntregas, loadUsuarios, pushError]);

  const handleSidebarSelect = (id) => {
    if (id === "cerrar-sesion") {
      cerrarSesion();
      showToast("Sesion cerrada correctamente.", "info");
      navigate("/", { replace: true });
      return;
    }
    setActive(id);
  };

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
            SECCION: SOLICITUDES
        ========================== */}
        {active === "solicitudes" && (
          <div className="p-6 text-[#111827] dark:text-gray-100 rounded-lg">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
              <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                Solicitudes de Turnos
              </h2>
              <ReviewFilter value={filtroReview} onChange={setFiltroReview} />
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
                minWidth="min-w-[680px]"
                containerClass="px-4"
                renderRow={(t) => (
                  <>
                    <td className="border p-2 text-center">{t.review}</td>
                    <td className="border p-2 text-center">{t.fecha}</td>
                    <td className="border p-2 text-center">{t.horario}</td>
                    <td className="border p-2 text-center">{t.sala}</td>
                    <td className="border p-2 text-center">
                      {t.zoomLink && (
                        <a href={t.zoomLink} target="_blank" rel="noreferrer">
                          <img
                            src="/icons/video_-2.png"
                            alt="Zoom"
                            className="w-5 h-5 mx-auto"
                          />
                        </a>
                      )}
                    </td>
                    <td className="border p-2 text-center">
                      <Status status={t.estado} />
                    </td>
                    <td className="border p-2 text-center">
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
            </div>

            <div className="mt-4 space-y-4 px-2 sm:hidden">
              {isTurnosSectionLoading ? (
                <div className="space-y-3 py-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <Skeleton key={index} height="4.5rem" />
                  ))}
                </div>
              ) : hasSolicitudes ? (
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

            {!isTurnosSectionLoading && (
              <Pagination
                totalItems={paginatedTurnosSolicitados.totalItems}
                itemsPerPage={ITEMS_PER_PAGE}
                currentPage={paginatedTurnosSolicitados.currentPage}
                onPageChange={setPageSolicitudes}
              />
            )}
          </div>
        )}

        {/* =========================
            SECCION: SOLICITUD ALUMNOS
        ========================== */}
        {active === "usuarios" && (
          <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
            {/*  Ajuste: se reemplaza el fragmento <> por un contenedor principal con padding y color coherente */}
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
              {/*  Ajuste: se centra el contenido y se limita el ancho maximo igual que en DashboardSuperadmin */}
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

              {/*  Tabla Desktop alineada visualmente */}
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
                    minWidth="min-w-[680px]" //  Ajuste: ancho minimo coherente con DashboardSuperadmin
                    containerClass="px-4" //  Ajuste: padding horizontal uniforme en la tabla
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
                          <Button
                            variant="success"
                            className="py-1"
                            onClick={() => handleAprobarUsuario(u)}
                            disabled={
                              isUsuariosSectionLoading ||
                              processingUsuario === u.id
                            }
                          >
                            Aprobar usuario
                          </Button>
                        </td>
                      </>
                    )}
                  />
                )}
              </div>

              {/*  Tarjetas Mobile con margenes coherentes */}
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
                      <Button
                        variant="success"
                        className="w-full py-1"
                        onClick={() => handleAprobarUsuario(u)}
                        disabled={
                          isUsuariosSectionLoading || processingUsuario === u.id
                        }
                      >
                        Aprobar usuario
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-md border-2 border-[#111827]/40 bg-white p-6 text-center shadow-md dark:border-[#333] dark:bg-[#1E1E1E]">
                    <p className="text-sm font-mono text-gray-100 dark:text-gray-300">No hay registros.</p>
                  </div>
                )}
              </div>

              {/*  Ajuste: paginacion alineada visualmente al final */}
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


