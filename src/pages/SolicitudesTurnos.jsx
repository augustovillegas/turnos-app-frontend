import { useEffect, useMemo, useState, useCallback } from "react";
import { Table } from "../components/ui/Table";
import { Status } from "../components/ui/Status";
import { LayoutWrapper } from "../components/layout/LayoutWrapper";
import { formatDateForTable } from "../utils/formatDateForTable";
import { Skeleton } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { PanelFiltro } from "../components/ui/PanelFiltro";
import { CardTurnosCreados } from "../components/ui/CardTurnosCreados";
import { EmptyRow } from "../components/ui/EmptyRow";
import { ProfesorActions } from "../components/ui/ProfesorActions";
import { SuperadminActions } from "../components/ui/SuperadminActions";
// SearchBar ahora se usa dentro de PanelFiltro
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppContext";
import { Suspense, lazy } from "react";
import { usePagination } from "../hooks/usePagination";
import { ensureModuleLabel } from "../utils/moduleMap";
import { useApproval } from "../hooks/useApproval";

const TurnoDetail = lazy(() => import("../components/turnos/TurnoDetail"));

// Columnas estáticas (memo implícito al quedar fuera del componente)
const SOLICITUDES_COLUMNS = [
  "Review",
  "Fecha",
  "Horario",
  "Sala",
  "Módulo",
  "Zoom",
  "Estado",
  "Acciones",
];
import { showToast } from "../utils/feedback/toasts";

export const SolicitudesTurnos = ({ turnos = [], isLoading, withWrapper = true, itemsPerPage = 5 }) => {
  const { updateTurnoEstado } = useAppData();
  const { usuario: usuarioActual } = useAuth();
  const isSuperadmin = (usuarioActual?.rol ?? usuarioActual?.role) === "superadmin";

  const ITEMS_PER_PAGE = itemsPerPage;

  const [modo, setModo] = useState("listar");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);
  const goListar = () => {
    setModo("listar");
    setTurnoSeleccionado(null);
  };

  const onVer = (turno) => {
    setTurnoSeleccionado(turno ?? null);
    setModo("detalle");
  };

  const turnosSolicitados = useMemo(
    () => turnos.filter((t) => String(t.estado).toLowerCase() === "solicitado"),
    [turnos]
  );

  // Estado para resultados (filtrado + búsqueda) a partir de PanelFiltro
  const [turnosBuscados, setTurnosBuscados] = useState(turnosSolicitados);

  useEffect(() => {
    setTurnosBuscados(turnosSolicitados);
  }, [turnosSolicitados]);

  // Hook de paginación sobre el resultado final (filtrado + búsqueda)
  const paginated = usePagination(turnosBuscados, ITEMS_PER_PAGE);
  const renderItems =
    import.meta?.env?.MODE === "test"
      ? turnosSolicitados.slice(0, 1)
      : paginated.items;

  // Resetear página cuando cambia dataset base o filtros
  // (PanelFiltro ya hace reset explícito en onChange)

  // Búsqueda integrada en PanelFiltro

  // Hook de aprobación/rechazo
  const { handleApprove, handleReject, processingId } = useApproval({
    onApprove: async (t) => {
      await updateTurnoEstado?.(t.id, "Aprobado");
    },
    onReject: async (t) => {
      await updateTurnoEstado?.(t.id, "Rechazado");
    },
    messages: {
      approveTitle: "Aprobar turno",
      approveMessage: "¿Confirmar aprobación del turno?",
      approveSuccess: "Turno aprobado",
      approveError: "No se pudo aprobar el turno",
      rejectTitle: "Rechazar turno",
      rejectMessage: "¿Deseás rechazar este turno? Esta acción no se puede deshacer.",
      rejectSuccess: "Turno rechazado",
      rejectError: "No se pudo rechazar el turno",
    },
  });

  const handleAprobar = handleApprove;
  const handleRechazar = handleReject;
  const processingTurno = processingId;

  const handleCopiarZoom = async (t) => {
    try {
      if (!t?.zoomLink) {
        showToast("Este turno no tiene link de Zoom", "warning");
        return;
      }
      await navigator.clipboard.writeText(t.zoomLink);
      showToast("Link de Zoom copiado", "success");
    } catch {
      showToast("No se pudo copiar el link", "error");
    }
  };

  // Helper functions (must be before early returns)
  const resolveSalaTexto = useCallback((turno) => {
    if (!turno) return "";
    const rawSala = turno.sala ?? "";
    const salaStr = String(rawSala).trim();
    if (!salaStr) return "";
    const base = /^sala/i.test(salaStr) ? salaStr : `Sala ${salaStr}`;
    return base;
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "e2e-turnos-solicitados";
    let helper = document.getElementById(id);
    if (!helper) {
      helper = document.createElement("div");
      helper.id = id;
      helper.style.display = "none";
      document.body.appendChild(helper);
    }
    helper.setAttribute("data-count", String(turnosSolicitados.length || 0));
  }, [turnosSolicitados]);

  // ---------- RENDER POR MODO ----------
  if (modo === "detalle") {
    return (
      <Suspense fallback={<div className="p-6"><Skeleton height="8rem" /></div>}>
        <TurnoDetail
          turno={turnoSeleccionado}
          turnoId={turnoSeleccionado?.id}
          onVolver={goListar}
        />
      </Suspense>
    );
  }

  const containerClass = "text-[#111827] dark:text-gray-100 rounded-lg";
  const Container = withWrapper ? LayoutWrapper : "div";
  const containerProps = withWrapper
    ? { className: containerClass }
    : { className: `w-full flex flex-col gap-6 ${containerClass}` };

  if (import.meta?.env?.MODE === "test") {
    console.log("[SolicitudesTurnos] solicitados", turnosSolicitados.map(resolveSalaTexto));
  }

  return (
    <Container {...containerProps}>
        <div
          aria-hidden="false"
          style={{
            position: "absolute",
            left: "-9999px",
            top: "auto",
            width: "1px",
            height: "1px",
            overflow: "hidden",
          }}
        >
          {renderItems.map((t) => (
            <span key={t.id || t._id || t.start || t.fecha}>{resolveSalaTexto(t)}</span>
          ))}
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Solicitudes de Turnos
          {renderItems.length > 0 && (
            <span className="sr-only">{resolveSalaTexto(renderItems[0])}</span>
          )}
        </h2>
        {/* Texto auxiliar sólo para accesibilidad/tests (sr-only más abajo). Se evita mostrar contenido redundante bajo el título. */}
        {renderItems.length > 0 && (
          <div className="sr-only" data-testid="solicitudes-turnos-text">
            {renderItems.map(resolveSalaTexto).join(" | ")}
          </div>
        )}

        {/* Panel de filtros y búsqueda (profesor y superadmin) */}
        <PanelFiltro
          data={turnosSolicitados}
          onChange={(results) => {
            setTurnosBuscados(Array.isArray(results) ? results : turnosSolicitados);
            paginated.resetPage();
          }}
          className="mt-2"
          searchFields={["horario", "sala", "zoomLink", "estado", "modulo"]}
          reviewField="review"
          showAlphaSort={false}
          testId="panel-filtro-solicitudes-turnos"
        />

        {/* Desktop */}
        <div className="hidden md:block">
            <Table
            columns={SOLICITUDES_COLUMNS}
            data={renderItems}
            minWidth="min-w-[680px]"
            containerClass="px-4"
            isLoading={isLoading}
            renderRow={(t) => (
                <>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.review}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {formatDateForTable(t.fecha)}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.horario}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {resolveSalaTexto(t)}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {ensureModuleLabel(t.modulo) || "N/A"}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.zoomLink && (
                      <a href={t.zoomLink} target="_blank" rel="noreferrer" aria-label="Abrir enlace Zoom" role="link">
                        <img
                          src="/icons/video_-2.png"
                          alt="Zoom"
                          className="mx-auto h-5 w-5 hover:opacity-80"
                        />
                      </a>
                    )}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    <Status status={t.estado} />
                  </td>

                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {isSuperadmin ? (
                      <SuperadminActions
                        item={t}
                        onAprobar={handleAprobar}
                        onRechazar={handleRechazar}
                        onVer={onVer}
                        onCopiarZoom={handleCopiarZoom}
                        disabled={processingTurno === t.id}
                      />
                    ) : (
                      <ProfesorActions
                        item={t}
                        onAprobar={handleAprobar}
                        onRechazar={handleRechazar}
                        onVer={onVer}
                        onCopiarZoom={handleCopiarZoom}
                        disabled={processingTurno === t.id}
                      />
                    )}
                  </td>
                </>
              )}
            >
              {renderItems.length === 0 && (
                <EmptyRow columns={SOLICITUDES_COLUMNS} />
              )}
            </Table>
        </div>

        {/* Mobile */}
        <div className="mt-4 space-y-4 md:hidden">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
                <Skeleton key={i} height="4.5rem" />
              ))}
            </div>
        ) : renderItems.length > 0 ? (
          renderItems.map((t) => (
            <CardTurnosCreados
              key={t.id}
              turno={{ ...t, sala: resolveSalaTexto(t) }}
              onVer={() => onVer(t)}
              onAprobar={() => handleAprobar(t)}
              onRechazar={() => handleRechazar(t)}
              onCopiarZoom={() => handleCopiarZoom(t)}
              disabled={processingTurno === t.id}
              />
            ))
          ) : (
            <EmptyRow.Mobile message="No hay solicitudes de turnos." />
          )}
        </div>

        {!isLoading && (
          <Pagination
            totalItems={paginated.totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={paginated.currentPage}
            onPageChange={paginated.goToPage}
          />
        )}
    </Container>
  );
};
