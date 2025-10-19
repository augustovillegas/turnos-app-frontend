// === Evaluar Entregas ===
// Panel para revisar, aprobar o rechazar entregables pendientes.
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppData } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Status } from "../components/ui/Status";
import { SearchBar } from "../components/ui/SearchBar";
import { Pagination } from "../components/ui/Pagination";
import { showToast } from "../utils/feedback/toasts";

export const EvaluarEntregas = () => {
  // --- Contexto de datos compartido ---
  const { entregas, updateEntrega } = useAppData();
  const { user } = useAuth();
  const ITEMS_PER_PAGE = 5; // --- Cantidad de entregas por pagina ---
  const [page, setPage] = useState(1);
  const [processingEntregaId, setProcessingEntregaId] = useState(null);

  // --- Utilidades para cambiar el estado de una entrega ---
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
          : "Entrega rechazada."
      );
    } catch (error) {
      showToast(
        error.message || "No se pudo actualizar la entrega.",
        "error"
      );
    } finally {
      setProcessingEntregaId(null);
    }
  };

  const handleAprobarEntrega = (entrega) => actualizarEstado(entrega, "Aprobado");
  const handleDesaprobarEntrega = (entrega) =>
    actualizarEstado(entrega, "Rechazado");

  // 🛠️ Fix lógica: contemplar `estado` y `reviewStatus` como equivalentes para "pendiente"
  const esPendiente = (e) => {
    const estado = (e?.estado || "").toLowerCase();
    const reviewStatus = (e?.reviewStatus || "").toLowerCase();
    return (
      estado === "pendiente" ||
      reviewStatus === "a revisar" || // alumno usa "A revisar"
      reviewStatus === "pendiente" ||
      (!e.estado && !e.reviewStatus) // si no hay estado definido, consideramos pendiente
    );
  };

  const moduloActual = useMemo(() => {
    if (!user) return null;
    const candidates = [
      user.cohort,
      user.cohorte,
      user.modulo,
      user.module,
    ];
    const found = candidates.find(
      (candidate) =>
        candidate !== undefined &&
        candidate !== null &&
        String(candidate).trim() !== ""
    );
    return found ? String(found).trim() : null;
  }, [user]);
  const moduloActualNormalized = moduloActual
    ? moduloActual.toLowerCase()
    : null;

  const moduloCoincide = useCallback((value) => {
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
  }, [moduloActualNormalized]);

  const entregasFiltradas = useMemo(() => {
    const listado = Array.isArray(entregas) ? entregas : [];
    if (!user) return listado;
    if (user.role === "superadmin") return listado;
    if (user.role === "profesor" && moduloActualNormalized) {
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
  }, [entregas, user, moduloActualNormalized, moduloCoincide]);

  // 🛠️ Fix lógica: usar esPendiente para derivar la lista a evaluar
  const entregasPendientes = entregasFiltradas.filter(esPendiente);

  const [entregasBuscadas, setEntregasBuscadas] = useState(entregasPendientes);
  const totalPendientes = entregasBuscadas.length;

  // --- Ajusta pagina si cambia la cantidad de pendientes ---
  useEffect(() => {
    setEntregasBuscadas(entregasPendientes);
  }, [entregasPendientes]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil((totalPendientes || 0) / ITEMS_PER_PAGE)
    );
    setPage((prev) => {
      if (totalPendientes === 0) return 1;
      if (prev > totalPages) return totalPages;
      if (prev < 1) return 1;
      return prev;
    });
  }, [totalPendientes, ITEMS_PER_PAGE]);

  // --- Paginacion en memoria para mostrar bloques manejables ---
  const paginatedEntregasPendientes = useMemo(() => {
    const totalPages = Math.ceil((totalPendientes || 0) / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: entregasBuscadas.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalPendientes,
      totalPages,
      currentPage,
    };
  }, [entregasBuscadas, totalPendientes, page, ITEMS_PER_PAGE]);

  // 🛠️ Fix lógica: normalizar el estado mostrado en UI (estado || reviewStatus || "Pendiente")
  const getEstadoUI = (e) => e?.estado || e?.reviewStatus || "Pendiente";

  return (
    <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
      {/* 🎨 Ajuste visual: contenedor general unificado con los demás dashboards */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        {/* 🎨 Encabezado consistente */}
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
            "reviewStatus", // 🛠️ Fix lógica: incluir también reviewStatus en el buscador
          ]}
          placeholder="Buscar entregables"
          onSearch={(results) => {
            setEntregasBuscadas(results);
            setPage(1);
          }}
        />

        {/* ---- Versión Desktop ---- */}
        <div className="hidden sm:block">
          <Table
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
            data={paginatedEntregasPendientes.items}
            minWidth="min-w-[680px]" // 🎨 Alineado con las tablas de otros módulos
            containerClass="px-4"
            renderRow={(e) => (
              <>
                <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                  Sprint {e.sprint}
                </td>
                <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                  {e.alumno || "Sin asignar"}
                </td>
                <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                  {e.githubLink ? (
                    <a
                      href={e.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      GitHub
                    </a>
                  ) : (
                    "No entregado"
                  )}
                </td>
                <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                  {e.renderLink ? (
                    <a
                      href={e.renderLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                    >
                      Render
                    </a>
                  ) : (
                    "No entregado"
                  )}
                </td>
                <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                  {e.comentarios || "-"}
                </td>
                <td className="border border-[#111827] p-2 text-center dark:border-[#333] dark:text-gray-200">
                  {e.fechaEntrega || "—"}
                </td>
                <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                  <Status status={getEstadoUI(e)} />
                  {/* 🛠️ Fix lógica: mostrar estado normalizado */}
                </td>
                <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                  {esPendiente(e) && ( // 🛠️ Fix lógica: permitir acciones si está pendiente considerando ambos campos
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
          />
        </div>

        {/* ---- Versión Mobile (Cards) ---- */}
        <div className="mt-4 space-y-4 px-2 sm:hidden">
          {paginatedEntregasPendientes.items.map((e) => (
            <div
              key={e.id}
              className="bg-white dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] rounded-2xl p-4 shadow-md transition-all hover:shadow-lg"
            >
              {/* 🎨 Alineado con cards del dashboard */}
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                  Sprint {e.sprint}
                </h3>
                <Status status={getEstadoUI(e)} />             
              </div>

              <p className="mb-1 text-sm dark:text-gray-200">
                <span className="font-semibold">Alumno:</span>{" "}
                {e.alumno || "Sin asignar"}
              </p>
              {e.fechaEntrega && (
                <p className="mb-1 text-sm dark:text-gray-200">
                  <span className="font-semibold">Fecha de entrega:</span>{" "}
                  {e.fechaEntrega}
                </p>
              )}
              <p className="mb-2 text-sm dark:text-gray-200">
                <span className="font-semibold">Comentarios:</span>{" "}
                {e.comentarios || "Sin comentarios."}
              </p>

              {/* Enlaces */}
              <div className="mt-2 space-y-1 text-sm">
                <div className="flex items-center gap-2">
                  <img
                    src="/icons/github_icon.png"
                    alt="GitHub"
                    className="h-4 w-4"
                  />
                  {e.githubLink ? (
                    <a
                      href={e.githubLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Ver repositorio GitHub
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      No entregado
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <img
                    src="/icons/render_icon.png"
                    alt="Render"
                    className="h-4 w-4"
                  />
                  {e.renderLink ? (
                    <a
                      href={e.renderLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Ver Render Deploy
                    </a>
                  ) : (
                    <span className="text-gray-500 dark:text-gray-400">
                      No entregado
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="mt-4 flex justify-end gap-2">
                {esPendiente(e) && ( // 🛠️ Fix lógica
                  <>
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
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 🎨 Paginación alineada visualmente */}
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
