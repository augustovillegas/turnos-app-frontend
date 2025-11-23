// === Evaluar Entregas ===
// Panel para revisar, aprobar o rechazar entregables pendientes.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { anyEstado } from "../utils/turnos/normalizeEstado";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Status } from "../components/ui/Status";
import { formatDateForTable } from "../utils/formatDateForTable";
import { SearchBar } from "../components/ui/SearchBar";
import { Pagination } from "../components/ui/Pagination";
import { showToast } from "../utils/feedback/toasts";

export const EvaluarEntregas = () => {
  const { entregas, updateEntrega } = useAppData();
  const { usuario: usuarioActual } = useAuth();
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);
  const [processingEntregaId, setProcessingEntregaId] = useState(null);

  useEffect(() => {
    console.log("[EvaluarEntregas] Mounted. Entregas count:", entregas.length, "Usuario:", usuarioActual?.email);
  }, [entregas, usuarioActual]);

  const actualizarEstado = async (entrega, nuevoEstado) => {
    if (!entrega?.id) return;
    setProcessingEntregaId(entrega.id);
    try {
      await updateEntrega(entrega.id, {
        estado: nuevoEstado,
        reviewStatus: nuevoEstado,
      });
      showToast(
        nuevoEstado === "Aprobado"
          ? "Entrega aprobada correctamente."
          : "Entrega desaprobada."
      );
    } catch (error) {
      showToast(error.message || "No se pudo actualizar la entrega.", "error");
    } finally {
      setProcessingEntregaId(null);
    }
  };

  const handleAprobarEntrega = (entrega) =>
    actualizarEstado(entrega, "Aprobado");
  const handleDesaprobarEntrega = (entrega) =>
    actualizarEstado(entrega, "Desaprobado");

  const esPendiente = (e) => {
      // ARQUITECTURA: Usa `anyEstado` para validar estados normalizados (case-insensitive).
      // Backend envía "A revisar" o "Pendiente"; helper unifica ambas variantes.
    const estadoActual = e?.estado || e?.reviewStatus || "";
    return anyEstado(estadoActual, ["Pendiente", "A revisar"]) || !estadoActual;
  };

  const moduloActual = useMemo(() => {
    if (!usuarioActual) return null;
    const candidates = [
      usuarioActual.cohort,
      usuarioActual.cohorte,
      usuarioActual.modulo,
      usuarioActual.module,
    ];
    const found = candidates.find((c) => c && String(c).trim() !== "");
    return found ? String(found).trim() : null;
  }, [usuarioActual]);

  const moduloActualNormalized = moduloActual
    ? moduloActual.toLowerCase()
    : null;

  const moduloCoincide = useCallback(
    (value) => {
      if (!moduloActualNormalized) return true;
      if (value === undefined || value === null) return false;
      if (Array.isArray(value))
        return value.some((item) => moduloCoincide(item));
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
    },
    [moduloActualNormalized]
  );

  const entregasFiltradas = useMemo(() => {
    const listado = Array.isArray(entregas) ? entregas : [];
    if (!usuarioActual) return listado;
    
    // NOTA: El backend (Nov 2025) aplica filtrado defensivo por módulo vía permissionUtils.buildModuleFilter
    // Este filtrado del cliente es redundante pero se mantiene como defensa en profundidad
    if (usuarioActual.role === "superadmin") return listado;
    if (usuarioActual.role === "profesor" && moduloActualNormalized) {
      return listado.filter((entrega) => {
        const candidates = [
          entrega.modulo,
          entrega.module,
          entrega.cohort,
          entrega.cohorte,
          entrega.moduloId,
          entrega.cohortId,
          entrega?.alumno?.modulo,
          entrega?.alumno?.cohort,
        ];
        return candidates.some(moduloCoincide);
      });
    }
    return listado;
  }, [entregas, usuarioActual, moduloActualNormalized, moduloCoincide]);

  const entregasPendientes = entregasFiltradas.filter(esPendiente);
  const [entregasBuscadas, setEntregasBuscadas] = useState(entregasPendientes);
  const totalPendientes = entregasBuscadas.length;

  useEffect(() => {
    setEntregasBuscadas(entregasPendientes);
  }, [entregasPendientes]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(totalPendientes / ITEMS_PER_PAGE));
    setPage((prev) => {
      if (totalPendientes === 0) return 1;
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalPendientes, ITEMS_PER_PAGE]);

  const paginatedEntregasPendientes = useMemo(() => {
    const totalPages = Math.ceil(totalPendientes / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: entregasBuscadas.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalPendientes,
      totalPages,
      currentPage,
    };
  }, [entregasBuscadas, totalPendientes, page, ITEMS_PER_PAGE]);

  const getEstadoUI = (e) => e?.estado || e?.reviewStatus || "A revisar";

  return (
    <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Evaluar Entregables
          </h2>
        </div>

        <SearchBar
          data={entregasPendientes}
          fields={[
            "sprint",
            "alumno",
            "githubLink",
            "renderLink",
            "comentarios",
            "estado",
            "reviewStatus",
          ]}
          placeholder="Buscar entregables"
          onSearch={(results) => {
            setEntregasBuscadas(results);
            setPage(1);
          }}
        />

        <Table
          responsive
          testId="evaluar-entregas"
          columns={[
            "Sprint",
            "Alumno",
            "GitHub",
            "Render",
            "Comentarios",
            "Fecha",
            "Estado",
            "Acción",
          ]}
          data={paginatedEntregasPendientes.items || []}
          minWidth="min-w-[680px]"
          containerClass="px-4"
          isLoading={false}
          emptyMessage="No hay entregas pendientes."
          renderRow={(e) => (
            <>
              <td className="border p-2 text-center">Sprint {e.sprint}</td>
              <td className="border p-2 text-center">
                {e.alumno || "Sin asignar"}
              </td>
              <td className="border p-2 text-center">
                {e.githubLink ? (
                  <a
                    href={e.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    GitHub
                  </a>
                ) : (
                  "No entregado"
                )}
              </td>
              <td className="border p-2 text-center">
                {e.renderLink ? (
                  <a
                    href={e.renderLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Render
                  </a>
                ) : (
                  "No entregado"
                )}
              </td>
              <td className="border p-2 text-center">
                {e.comentarios || "-"}
              </td>
              <td className="border p-2 text-center">
                {formatDateForTable(e.fechaEntrega) || "—"}
              </td>
              <td className="border p-2 text-center">
                <Status status={getEstadoUI(e)} />
              </td>
              <td className="border p-2 text-center">
                {esPendiente(e) && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="success"
                      className="py-1"
                      onClick={() => handleAprobarEntrega(e)}
                      disabled={processingEntregaId === e.id}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="danger"
                      className="py-1"
                      onClick={() => handleDesaprobarEntrega(e)}
                      disabled={processingEntregaId === e.id}
                    >
                      Desaprobar
                    </Button>
                  </div>
                )}
              </td>
            </>
          )}
          renderMobileCard={(e) => (
            <div className="bg-white dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] rounded-md p-4 shadow-md">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                  Sprint {e.sprint}
                </h3>
                <Status status={getEstadoUI(e)} />
              </div>

              <p className="text-sm dark:text-gray-200">
                <strong>Alumno:</strong> {e.alumno || "Sin asignar"}
              </p>
              <p className="text-sm dark:text-gray-200">
                <strong>Fecha:</strong> {formatDateForTable(e.fechaEntrega) || "—"}
              </p>
              <p className="text-sm dark:text-gray-200 mb-2">
                <strong>Comentarios:</strong> {e.comentarios || "—"}
              </p>

              <div className="flex justify-between text-sm">
                <a
                  href={e.githubLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`${
                    e.githubLink
                      ? "text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  GitHub
                </a>
                <a
                  href={e.renderLink || "#"}
                  target="_blank"
                  rel="noreferrer"
                  className={`${
                    e.renderLink
                      ? "text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  Render
                </a>
              </div>

              {esPendiente(e) && (
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="success"
                    className="py-1 text-xs"
                    onClick={() => handleAprobarEntrega(e)}
                    disabled={processingEntregaId === e.id}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    className="py-1 text-xs"
                    onClick={() => handleDesaprobarEntrega(e)}
                    disabled={processingEntregaId === e.id}
                  >
                    Desaprobar
                  </Button>
                </div>
              )}
            </div>
          )}
        />

        <Pagination
          totalItems={paginatedEntregasPendientes.totalItems}
          itemsPerPage={ITEMS_PER_PAGE}
          currentPage={paginatedEntregasPendientes.currentPage}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};
