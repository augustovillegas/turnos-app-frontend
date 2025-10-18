// === Dashboard Alumno ===
// Panel del estudiante: solicitar turnos, ver historial y cargar entregables.
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SideBar } from "../components/layout/SideBar";
import { Button } from "../components/ui/Button";
import { Status } from "../components/ui/Status";
import { Table } from "../components/ui/Table";
import { useAppData } from "../context/AppContext";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { CardTurno } from "../components/ui/CardTurno";
import { EntregaForm } from "../components/ui/EntregaForm";
import { CardEntrega } from "../components/ui/CardEntrega";
import { SearchBar } from "../components/ui/SearchBar";
import { Pagination } from "../components/ui/Pagination";
import { Configuracion } from "./Configuracion";
import { showToast } from "../utils/feedback/toasts";
import {
  buildTurnoPayloadFromForm,
  formValuesFromTurno,
} from "../utils/turnos/form";
import { useAuth } from "../context/AuthContext";
import { useModal } from "../context/ModalContext";
import { useLoading } from "../context/LoadingContext";
import { Skeleton } from "../components/ui/Skeleton";

export const DashboardAlumno = () => {
  // --- Contexto compartido y autenticacion del alumno ---
  // App context
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
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const { showModal } = useModal();
  const { isLoading } = useLoading();

  // --- Estado local: pestaña activa y formularios de entregas ---
  const [active, setActive] = useState("turnos");
  const [filtroReview, setFiltroReview] = useState("todos");
  const [processingTurno, setProcessingTurno] = useState(null);

  const [sprint, setSprint] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [renderLink, setRenderLink] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [entregaErrors, setEntregaErrors] = useState({});
  const ITEMS_PER_PAGE = 5;
  const [pageTurnosDisponibles, setPageTurnosDisponibles] = useState(1);
  const [pageMisTurnos, setPageMisTurnos] = useState(1);
  const [pageEntregas, setPageEntregas] = useState(1);

  // --- Items de navegacion lateral del dashboard ---
  const items = [
    { id: "turnos", label: "Solicitar turnos", icon: "/icons/calendar-1.png" },
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
  ];

  // --- Acciones sobre solicitudes de turnos ---
  const handleSolicitarTurno = async (turno) => {
    if (!turno || turno.estado !== "Disponible") return;
    setProcessingTurno(turno.id);
    try {
      const payload = buildTurnoPayloadFromForm({
        ...formValuesFromTurno(turno),
        review: turno.review,
        comentarios: turno.comentarios || "",
        estado: "Solicitado",
      });
      await updateTurno(turno.id, payload);
      showToast("Turno solicitado correctamente.");
    } catch (error) {
      showToast(error.message || "No se pudo solicitar el turno.", "error");
    } finally {
      setProcessingTurno(null);
    }
  };

  // --- Carga inicial de turnos y entregas ---
  useEffect(() => {
    if (!user || !token) return;
    const alumnoId = user._id ?? user.id ?? user.uid;
    if (!alumnoId) return;

    const fetchData = async () => {
      try {
        await Promise.all([
          loadTurnos({ userId: alumnoId }),
          loadEntregas({ alumnoId }),
        ]);
      } catch (error) {
        console.error("Error al cargar los datos del alumno", error);
        showToast("No se pudieron cargar tus datos.", "error");
      }
    };

    fetchData();
  }, [user, token, loadTurnos, loadEntregas]);

  const handleCancelarTurno = (turno) => {
    if (!turno || turno.estado !== "Solicitado") return;

    // Mostramos el modal global con tipo "warning" y texto dinámico
    showModal({
      type: "warning",
      title: "Cancelar solicitud",
      message: `¿Cancelar la solicitud para la sala ${turno.sala}?`,

      // onConfirm: lo que sucede si el usuario confirma la acción
      onConfirm: async () => {
        setProcessingTurno(turno.id);

        try {
          const payload = buildTurnoPayloadFromForm({
            ...formValuesFromTurno(turno),
            review: turno.review,
            comentarios: turno.comentarios || "",
            estado: "Disponible", // 🔁 se revierte el estado del turno
          });

          await updateTurno(turno.id, payload);
          showToast("Solicitud cancelada."); // Notificación visual
        } catch (error) {
          showToast(
            error.message || "No se pudo cancelar la solicitud.",
            "error"
          );
        } finally {
          setProcessingTurno(null);
        }
      },
    });
  };

  // --- Gestion de nuevas entregas cargadas por el alumno ---
  const handleAgregarEntrega = async () => {
    const validation = {};
    if (!sprint) {
      validation.sprint = "Seleccioná el sprint a entregar.";
    }
    if (!githubLink.trim()) {
      validation.githubLink = "Ingresá el enlace del repositorio.";
    } else if (!githubLink.startsWith("http")) {
      validation.githubLink = "El enlace de GitHub debe ser válido.";
    }
    if (renderLink && !renderLink.startsWith("http")) {
      validation.renderLink = "El enlace de deploy debe ser válido.";
    }

    if (Object.keys(validation).length > 0) {
      setEntregaErrors(validation);
      showToast("Revisá los datos de la entrega.", "warning");
      return;
    }

    const alumnoId = user?._id ?? user?.id ?? user?.uid;
    if (!alumnoId) {
      showToast(
        "No se pudo identificar al alumno para registrar la entrega.",
        "error"
      );
      return;
    }

    const sprintNumber = Number(sprint);
    const nueva = {
      sprint: Number.isNaN(sprintNumber) ? sprint : sprintNumber,
      githubLink: githubLink.trim(),
      renderLink: renderLink.trim(),
      comentarios: comentarios.trim(),
      reviewStatus: "A revisar",
      estado: "A revisar",
      alumnoId,
      modulo: user?.modulo ?? "",
    };

    setEntregaErrors({});
    try {
      await createEntregaRemoto(nueva);
      showToast("Entrega registrada correctamente.");
      setSprint("");
      setGithubLink("");
      setRenderLink("");
      setComentarios("");
    } catch (error) {
      showToast(
        error.message || "No se pudo registrar la entrega.",
        "error"
      );
    }
  };


  // --- Utilidad comun para aplicar el filtro de review ---
  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  const turnosHistorial = aplicarFiltro(
    turnos.filter(
      (t) =>
        t.estado === "Aprobado" ||
        t.estado === "Rechazado" ||
        t.estado === "Solicitado"
    )
  );

  const turnosDisponibles = aplicarFiltro(turnos);
  const [turnosDisponiblesBuscados, setTurnosDisponiblesBuscados] =
    useState(turnosDisponibles);
  const [turnosHistorialBuscados, setTurnosHistorialBuscados] =
    useState(turnosHistorial);
  const [entregasBuscadas, setEntregasBuscadas] = useState(entregas);

  const totalTurnosDisponibles = turnosDisponiblesBuscados.length;
  const totalTurnosHistorial = turnosHistorialBuscados.length;
  const totalEntregas = entregasBuscadas.length;

  useEffect(() => {
    setPageTurnosDisponibles(1);
    setPageMisTurnos(1);
  }, [filtroReview]);

  useEffect(() => {
    setTurnosDisponiblesBuscados(turnosDisponibles);
  }, [turnosDisponibles]);

  useEffect(() => {
    setTurnosHistorialBuscados(turnosHistorial);
  }, [turnosHistorial]);

  useEffect(() => {
    setEntregasBuscadas(entregas);
  }, [entregas]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((totalTurnosDisponibles || 0) / ITEMS_PER_PAGE)
    );
    setPageTurnosDisponibles((prev) => {
      if (totalTurnosDisponibles === 0) return 1;
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalTurnosDisponibles, ITEMS_PER_PAGE]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((totalTurnosHistorial || 0) / ITEMS_PER_PAGE)
    );
    setPageMisTurnos((prev) => {
      if (totalTurnosHistorial === 0) return 1;
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalTurnosHistorial, ITEMS_PER_PAGE]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((totalEntregas || 0) / ITEMS_PER_PAGE)
    );
    setPageEntregas((prev) => {
      if (totalEntregas === 0) return 1;
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalEntregas, ITEMS_PER_PAGE]);

  const paginatedTurnosDisponibles = useMemo(() => {
    const totalPages =
      Math.ceil((totalTurnosDisponibles || 0) / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(
      Math.max(pageTurnosDisponibles, 1),
      totalPages
    );
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: turnosDisponiblesBuscados.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalTurnosDisponibles,
      totalPages,
      currentPage,
    };
  }, [
    turnosDisponiblesBuscados,
    totalTurnosDisponibles,
    pageTurnosDisponibles,
    ITEMS_PER_PAGE,
  ]);

  const paginatedTurnosHistorial = useMemo(() => {
    const totalPages =
      Math.ceil((totalTurnosHistorial || 0) / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(Math.max(pageMisTurnos, 1), totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: turnosHistorialBuscados.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalTurnosHistorial,
      totalPages,
      currentPage,
    };
  }, [
    turnosHistorialBuscados,
    totalTurnosHistorial,
    pageMisTurnos,
    ITEMS_PER_PAGE,
  ]);

  const paginatedEntregas = useMemo(() => {
    const totalPages = Math.ceil((totalEntregas || 0) / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(Math.max(pageEntregas, 1), totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: entregasBuscadas.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalEntregas,
      totalPages,
      currentPage,
    };
  }, [entregasBuscadas, totalEntregas, pageEntregas, ITEMS_PER_PAGE]);

  const isTurnosSectionLoading = turnosLoading || isLoading("turnos");
  const isEntregasSectionLoading = isLoading("entregas");
  const hasTurnosDisponibles =
    paginatedTurnosDisponibles.totalItems > 0 &&
    paginatedTurnosDisponibles.items.length > 0;
  const hasTurnosHistorial =
    paginatedTurnosHistorial.totalItems > 0 &&
    paginatedTurnosHistorial.items.length > 0;
  const hasEntregas =
    paginatedEntregas.totalItems > 0 && paginatedEntregas.items.length > 0;

  const handleSidebarSelect = (id) => {
    if (id === "logout") {
      logout();
      navigate("/", { replace: true });
      showToast("Sesion cerrada correctamente.", "info");
      return;
    }
    setActive(id);
  };

  return (
    <div className="flex min-h-screen bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <SideBar items={items} active={active} onSelect={handleSidebarSelect} />

      <div className="flex-1 p-6">
        {/* =========================
            SECCIÓN: TURNOS DISPONIBLES
        ========================== */}
        {active === "turnos" && (
          <div className="min-h-screen bg-[#017F82] p-6 text-[#111827] transition-colors duration-300 dark:bg-[#0F3D3F] dark:text-gray-100 rounded-lg shadow-md">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                  Listado de Turnos Disponibles
                </h1>
              </div>

              <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

              <SearchBar
                data={turnosDisponibles}
                fields={[
                  "sala",
                  "fecha",
                  "horario",
                  "estado",
                  "review",
                  "comentarios",
                ]}
                placeholder="Buscar turnos disponibles"
                onSearch={(results) => {
                  setTurnosDisponiblesBuscados(results);
                  setPageTurnosDisponibles(1);
                }}
              />

                {/* Tabla Desktop */}
              <div className="hidden sm:block">
                {isTurnosSectionLoading ? (
                  <div className="flex flex-col gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} height="1.25rem" />
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
                      "Acci??n",
                    ]}
                    data={paginatedTurnosDisponibles.items}
                    minWidth="min-w-[680px]"
                    containerClass="px-4"
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
                                className="w-5 h-5 mx-auto hover:opacity-80"
                              />
                            </a>
                          )}
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                          <Status status={t.estado || "Disponible"} />
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                          {t.estado === "Disponible" && (
                            <Button
                              variant="primary"
                              className="py-1"
                              onClick={() => handleSolicitarTurno(t)}
                              disabled={
                                isTurnosSectionLoading ||
                                processingTurno === t.id
                              }
                            >
                              Solicitar turno
                            </Button>
                          )}
                          {t.estado === "Solicitado" && (
                            <Button
                              variant="secondary"
                              className="py-1"
                              onClick={() => handleCancelarTurno(t)}
                              disabled={
                                isTurnosSectionLoading ||
                                processingTurno === t.id
                              }
                            >
                              Cancelar solicitud
                            </Button>
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
                      <Skeleton key={index} height="4.5rem" />
                    ))}
                  </div>
                ) : hasTurnosDisponibles ? (
                  paginatedTurnosDisponibles.items.map((t) => (
                    <CardTurno
                      key={t.id}
                      turno={t}
                      onSolicitar={() => handleSolicitarTurno(t)}
                      onCancelar={() => handleCancelarTurno(t)}
                      disabled={
                        isTurnosSectionLoading || processingTurno === t.id
                      }
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-100 dark:text-gray-300 text-center">
                    No hay turnos disponibles.
                  </p>
                )}
              </div>

              {!isTurnosSectionLoading && hasTurnosDisponibles && (
                <Pagination
                  totalItems={paginatedTurnosDisponibles.totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={paginatedTurnosDisponibles.currentPage}
                  onPageChange={setPageTurnosDisponibles}
                />
              )}
            </div>
          </div>
        )}

        {/* =========================
            SECCIÓN: MIS TURNOS
        ========================== */}
        {active === "mis-turnos" && (
          <div className="min-h-screen bg-[#017F82] p-6 text-[#111827] transition-colors duration-300 dark:bg-[#0F3D3F] dark:text-gray-100 rounded-lg shadow-md">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                  Mis Turnos
                </h1>
              </div>

              <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

              <SearchBar
                data={turnosHistorial}
                fields={[
                  "sala",
                  "fecha",
                  "horario",
                  "estado",
                  "review",
                  "comentarios",
                ]}
                placeholder="Buscar en mis turnos"
                onSearch={(results) => {
                  setTurnosHistorialBuscados(results);
                  setPageMisTurnos(1);
                }}
              />

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
                      "Acci??n",
                    ]}
                    data={paginatedTurnosHistorial.items}
                    minWidth="min-w-[680px]"
                    containerClass="px-4"
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
                        <td className="border p-2 text-center dark:border-[#333]">
                          {t.zoomLink ? (
                            <a href={t.zoomLink} target="_blank" rel="noreferrer">
                              <img
                                src="/icons/video_-2.png"
                                alt="Zoom"
                                className="w-5 h-5 mx-auto hover:opacity-80"
                              />
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                          <Status status={t.estado || "-"} />
                        </td>
                        <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                          {t.estado === "Solicitado" && (
                            <Button
                              variant="secondary"
                              className="py-1"
                              onClick={() => handleCancelarTurno(t)}
                              disabled={
                                isTurnosSectionLoading ||
                                processingTurno === t.id
                              }
                            >
                              Cancelar turno
                            </Button>
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
                      <Skeleton key={index} height="4.5rem" />
                    ))}
                  </div>
                ) : hasTurnosHistorial ? (
                  paginatedTurnosHistorial.items.map((t) => (
                    <CardTurno
                      key={t.id}
                      turno={t}
                      onCancelar={() => handleCancelarTurno(t)}
                      disabled={
                        isTurnosSectionLoading || processingTurno === t.id
                      }
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-100 dark:text-gray-300 text-center">
                    No tenes turnos registrados.
                  </p>
                )}
              </div>

              {!isTurnosSectionLoading && hasTurnosHistorial && (
                <Pagination
                  totalItems={paginatedTurnosHistorial.totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={paginatedTurnosHistorial.currentPage}
                  onPageChange={setPageMisTurnos}
                />
              )}
            </div>
          </div>
        )}

        {/* =========================
            SECCIÓN: ENTREGABLES
        ========================== */}
        {active === "Entregables" && (
          <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
              {/* ====== TÍTULO ====== */}
              <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                <h1 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                  Entregables (Trabajos Prácticos)
                </h1>
              </div>

              {/* ====== FORMULARIO SIN DOBLE FONDO ====== */}
              <EntregaForm
                sprint={sprint}
                githubLink={githubLink}
                renderLink={renderLink}
                comentarios={comentarios}
                setSprint={setSprint}
                setGithubLink={setGithubLink}
                setRenderLink={setRenderLink}
                setComentarios={setComentarios}
                errors={entregaErrors}
                onAgregar={handleAgregarEntrega}
              />

              {/* ====== BUSCADOR ====== */}
              <SearchBar
                data={entregas}
                fields={[
                  "sprint",
                  "githubLink",
                  "renderLink",
                  "comentarios",
                  "reviewStatus",
                ]}
                placeholder="Buscar entregas"
                onSearch={(results) => {
                  setEntregasBuscadas(results);
                  setPageEntregas(1);
                }}
              />


              {/* ====== TABLA DESKTOP ====== */}
              <div className="hidden sm:block">
                {isEntregasSectionLoading ? (
                  <div className="space-y-3 py-6">
                    {Array.from({ length: 4 }).map((_, index) => (
                      <Skeleton key={index} height="2.75rem" />
                    ))}
                  </div>
                ) : (
                  <Table
                    columns={[
                      "Sprint",
                      "GitHub",
                      "Render",
                      "Comentarios",
                      "Estado",
                      "Acci??n",
                    ]}
                    data={paginatedEntregas.items}
                    minWidth="min-w-[680px]"
                    containerClass="px-4"
                    renderRow={(e) => (
                      <>
                        <td className="border border-[#111827]/30 p-2 text-center dark:border-[#333] dark:text-gray-200">
                          {e.sprint}
                        </td>
                        <td className="border border-[#111827]/30 p-2 text-center dark:border-[#333]">
                          <a
                            href={e.githubLink}
                            target="_blank"
                            rel="noreferrer"
                            className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                          >
                            {e.githubLink}
                          </a>
                        </td>
                        <td className="border border-[#111827]/30 p-2 text-center dark:border-[#333]">
                          {e.renderLink ? (
                            <a
                              href={e.renderLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                            >
                              {e.renderLink}
                            </a>
                          ) : (
                            "-"
                          )}
                        </td>
                        <td className="border border-[#111827]/30 p-2 text-center dark:border-[#333] dark:text-gray-200">
                          {e.comentarios || "-"}
                        </td>
                        <td className="border border-[#111827]/30 p-2 text-center dark:border-[#333]">
                          <Status status={e.reviewStatus} />
                        </td>
                        <td className="border border-[#111827]/30 p-2 text-center dark:border-[#333]">
                          {e.reviewStatus === "A revisar" && (
                            <Button
                              variant="danger"
                              className="py-1"
                              onClick={async () => {
                                if (
                                  window.confirm(
                                    "Cancelar el envio? Podras volver a cargarlo cuando tengas los ajustes listos."
                                  )
                                ) {
                                  try {
                                    await removeEntregaRemoto(e.id);
                                    showToast("Entrega cancelada.", "info");
                                  } catch (error) {
                                    showToast(
                                      error.message ||
                                        "No se pudo cancelar la entrega.",
                                      "error"
                                    );
                                  }
                                }
                              }}
                              disabled={isEntregasSectionLoading}
                            >
                              Cancelar
                            </Button>
                          )}
                        </td>
                      </>
                    )}
                  />
                )}
              </div>

              {/* ====== TARJETAS MOBILE ====== */}
              <div className="mt-4 space-y-4 px-2 sm:hidden">
                {isEntregasSectionLoading ? (
                  <div className="space-y-3 py-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <Skeleton key={index} height="4.5rem" />
                    ))}
                  </div>
                ) : hasEntregas ? (
                  paginatedEntregas.items.map((entrega) => (
                    <CardEntrega
                      key={entrega.id}
                      entrega={entrega}
                      onCancelar={async () => {
                        if (
                          window.confirm(
                            "Estas seguro de cancelar esta entrega?"
                          )
                        ) {
                          try {
                            await removeEntregaRemoto(entrega.id);
                            showToast("Entrega cancelada.", "info");
                          } catch (error) {
                            showToast(
                              error.message ||
                                "No se pudo cancelar la entrega.",
                              "error"
                            );
                          }
                        }
                      }}
                    />
                  ))
                ) : (
                  <p className="text-sm text-gray-100 dark:text-gray-300 text-center">
                    No hay entregas registradas.
                  </p>
                )}
              </div>

              {!isEntregasSectionLoading && hasEntregas && (
                <Pagination
                  totalItems={paginatedEntregas.totalItems}
                  itemsPerPage={ITEMS_PER_PAGE}
                  currentPage={paginatedEntregas.currentPage}
                  onPageChange={setPageEntregas}
                />
              )}

            </div>
          </div>
        )}

        {/* =========================
            SECCIÓN: CONFIGURACION
        ========================== */}
        {active === "config" && <Configuracion />}
      </div>
    </div>
  );
};
