// === Evaluar Entregas ===
// Panel para revisar, aprobar o rechazar entregables pendientes.
import { useEffect, useMemo, useState, useRef } from "react";
import { useAppData } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import { useLoading } from "../context/LoadingContext";
import { anyEstado } from "../utils/turnos/normalizeEstado";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { DropdownActions } from "../components/ui/DropdownActions";
import { Status } from "../components/ui/Status";
import { formatDateForTable } from "../utils/formatDateForTable";
import { SearchBar } from "../components/ui/SearchBar";
import { Pagination } from "../components/ui/Pagination";
import { showToast } from "../utils/feedback/toasts";
import { paginate } from "../utils/pagination";

import {
  ensureModuleLabel,
  labelToModule,
  moduleToLabel,
  coincideModulo,
} from "../utils/moduleMap";

export const EvaluarEntregas = () => {
  // Agregamos loadEntregas para disparar la carga si la vista se monta directamente (ruta profunda)
  const { entregas, updateEntrega, loadEntregas } = useAppData();
  const { usuario: usuarioActual } = useAuth();
  const { isLoading } = useLoading();
  const ITEMS_PER_PAGE = 5;
  const [page, setPage] = useState(1);
  const [processingEntregaId, setProcessingEntregaId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("Pendientes"); // "Pendientes" | specific reviewStatus | "Todos"
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    console.log("[EvaluarEntregas] Mounted. Entregas count:", entregas.length, "Usuario:", usuarioActual?.email);
    console.log("[EvaluarEntregas] Usuario completo:", JSON.stringify(usuarioActual, null, 2));
    console.log("[EvaluarEntregas] First 3 entregas:", JSON.stringify(entregas.slice(0, 3), null, 2));
  }, [entregas, usuarioActual]);

  // Carga defensiva: si el profesor/superadmin entra directo a /evaluar-entregas sin pasar por el dashboard
  useEffect(() => {
    if (!usuarioActual) return;
    if (hasLoadedRef.current) return; // Evitar loop infinito
    if (usuarioActual.role === "profesor" || usuarioActual.role === "superadmin") {
      console.log("[EvaluarEntregas] Triggering loadEntregas() (defensive autoload)");
      hasLoadedRef.current = true;
      loadEntregas?.();
    }
  }, [usuarioActual, loadEntregas]);

  const actualizarEstado = async (entrega, nuevoEstado) => {
    if (!entrega?.id) return;
    setProcessingEntregaId(entrega.id);
    try {
      // Backend Submission solo acepta reviewStatus (NO estado)
      await updateEntrega(entrega.id, {
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
    const estadoActual = e?.reviewStatus || "";
    return anyEstado(estadoActual, ["Pendiente", "A revisar"]) || !estadoActual;
  };

  const moduloEtiqueta = useMemo(() => {
    if (!usuarioActual) return null;
    const etiquetaDirecta = [
      ensureModuleLabel(usuarioActual.modulo),
      ensureModuleLabel(usuarioActual.module),
      ensureModuleLabel(usuarioActual.moduleLabel), // <-- añadido: backend expone virtual moduleLabel
      ensureModuleLabel(usuarioActual.moduloSlug),
      ensureModuleLabel(usuarioActual.moduleCode),
      ensureModuleLabel(usuarioActual.moduleNumber),
    ].find(Boolean);
    if (etiquetaDirecta) return etiquetaDirecta;

    const desdeCohorte = [
      usuarioActual.cohort,
      usuarioActual.cohorte,
      usuarioActual.cohortId,
    ]
      .map(moduleToLabel)
      .find(Boolean);

    return desdeCohorte ?? null;
  }, [usuarioActual]);

  const cohortAsignado = useMemo(() => {
    if (!usuarioActual) return null;
    const candidatos = [
      usuarioActual.cohort,
      usuarioActual.cohorte,
      usuarioActual.cohortId,
      usuarioActual.moduleCode,
      usuarioActual.moduleNumber,
    ];
    for (const candidato of candidatos) {
      if (candidato == null) continue;
      const numeroDirecto = Number(String(candidato).trim());
      if (Number.isFinite(numeroDirecto) && numeroDirecto > 0) {
        return Math.trunc(numeroDirecto);
      }
      const numeroDesdeEtiqueta = labelToModule(candidato);
      if (numeroDesdeEtiqueta != null) return numeroDesdeEtiqueta;
    }
    if (moduloEtiqueta) {
      const numeroDesdeModulo = labelToModule(moduloEtiqueta);
      if (numeroDesdeModulo != null) return numeroDesdeModulo;
    }
    return null;
  }, [usuarioActual, moduloEtiqueta]);

  // Filtrado por módulo delegado completamente al backend (permissionUtils). Se usa listado directo.
  const entregasFiltradas = useMemo(() => {
    const result = Array.isArray(entregas) ? entregas : [];
    console.log("[EvaluarEntregas] entregasFiltradas:", result.length, "items");
    return result;
  }, [entregas]);

  // Base: ya filtradas por módulo (o no, próximamente se removerá redundancia)
  const entregasPendientes = useMemo(() => entregasFiltradas.filter(esPendiente), [entregasFiltradas]);

  // Aplicar filtro de estado seleccionado
  const entregasFiltradasPorEstado = useMemo(() => {
    console.log("[EvaluarEntregas] Aplicando filtro de estado:", filterStatus);
    let result;
    if (filterStatus === "Todos") {
      result = entregasFiltradas;
    } else if (filterStatus === "Pendientes") {
      result = entregasPendientes;
    } else {
      result = entregasFiltradas.filter((e) => e?.reviewStatus === filterStatus);
    }
    console.log("[EvaluarEntregas] Entregas después de filtro estado:", result.length);
    console.log("[EvaluarEntregas] Detalle filtradas por estado:", JSON.stringify(result.map(e => ({ 
      id: e.id, 
      alumno: e.alumno, 
      alumnoNombre: e.alumnoNombre,
      student: e.student,
      alumnoId: e.alumnoId,
      reviewStatus: e.reviewStatus,
      sprint: e.sprint 
    })), null, 2));
    return result;
  }, [filterStatus, entregasFiltradas, entregasPendientes]);

  const [entregasBuscadas, setEntregasBuscadas] = useState(entregasFiltradasPorEstado);

  useEffect(() => {
    setEntregasBuscadas(entregasFiltradasPorEstado);
    setPage(1); // Reset página cuando cambia dataset filtrado
  }, [entregasFiltradasPorEstado]);

  const paginatedEntregasPendientes = useMemo(
    () => paginate(entregasBuscadas, page, ITEMS_PER_PAGE),
    [entregasBuscadas, page]
  );

  // Simplificación: usar sólo reviewStatus proveniente del backend/normalizador.
  const getEstadoUI = (e) => e?.reviewStatus || "A revisar";

  return (
    <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Evaluar Entregables
        </h2>

        <SearchBar
          data={entregasFiltradasPorEstado}
          fields={[
            "sprint",
            "alumno",
            "githubLink",
            "renderLink",
            "comentarios",
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
            "Acciones",
          ]}
          data={paginatedEntregasPendientes.items || []}
          minWidth="min-w-[680px]"
          containerClass="px-4"
          isLoading={isLoading("entregas")}
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
                {formatDateForTable(e.fechaEntrega) || "-"}
              </td>
              <td className="border p-2 text-center">
                <Status status={getEstadoUI(e)} />
              </td>
              <td className="border p-2 text-center">
                {esPendiente(e) ? (
                  <DropdownActions
                    options={[
                      {
                        label: "Aprobar",
                        icon: "/icons/check.png",
                        onClick: () => handleAprobarEntrega(e),
                        disabled: processingEntregaId === e.id,
                      },
                      {
                        label: "Desaprobar",
                        icon: "/icons/close.png",
                        danger: true,
                        onClick: () => handleDesaprobarEntrega(e),
                        disabled: processingEntregaId === e.id,
                      },
                    ]}
                  />
                ) : (
                  <span className="text-xs opacity-60">-</span>
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
                <strong>Fecha:</strong> {formatDateForTable(e.fechaEntrega) || "-"}
              </p>
              <p className="text-sm dark:text-gray-200 mb-2">
                <strong>Comentarios:</strong> {e.comentarios || "-"}
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
