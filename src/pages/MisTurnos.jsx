import { useState, useEffect, useMemo } from "react";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { SearchBar } from "../components/ui/SearchBar";
import { Table } from "../components/ui/Table";
import { ListToolbar } from "../components/ui/ListToolbar";
import { useAppData } from "../context/AppContext";
import { Status } from "../components/ui/Status";
import { formatDateForTable } from "../utils/formatDateForTable";
import { Skeleton } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { CardTurno } from "../components/ui/CardTurno";
import { AlumnoActions } from "../components/ui/AlumnoActions";
import { EmptyRow } from "../components/ui/EmptyRow";
import { paginate } from "../utils/pagination";

export const MisTurnos = ({
  turnos,
  handleCancelarTurno,
  processingTurno,
  isTurnosSectionLoading,
  filtroReview,
  setFiltroReview,
  pageMisTurnos,
  setPageMisTurnos,
  ITEMS_PER_PAGE,
}) => {
  const { loadTurnos } = useAppData();
  const [turnosBuscados, setTurnosBuscados] = useState(turnos);

  // Actualizar resultados cuando cambien los turnos
  useEffect(() => {
    setTurnosBuscados(turnos);
    setPageMisTurnos(1); // Reset página cuando cambian turnos
  }, [turnos, setPageMisTurnos]);

  // Resetear página cuando cambia el filtro de review
  useEffect(() => {
    setPageMisTurnos(1);
  }, [filtroReview, setPageMisTurnos]);

  const paginationData = useMemo(
    () => paginate(turnosBuscados, pageMisTurnos, ITEMS_PER_PAGE),
    [turnosBuscados, pageMisTurnos]
  );

  const hasTurnos = paginationData.items.length > 0;

  return (
    <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <ListToolbar
          title="Mis Turnos"
          total={Array.isArray(turnos) ? turnos.length : 0}
          filtered={paginationData.totalItems}
          loading={isTurnosSectionLoading}
          onRefresh={() => loadTurnos?.()}
          currentPage={paginationData.currentPage}
          totalPages={paginationData.totalPages}
        >
          <ReviewFilter value={filtroReview} onChange={setFiltroReview} />
        </ListToolbar>

        <SearchBar
          data={turnos}
          fields={["sala", "fecha", "horario", "estado", "review", "comentarios"]}
          placeholder="Buscar en mis turnos"
          onSearch={(results) => {
            setTurnosBuscados(results);
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
              columns={["Review", "Fecha", "Horario", "Sala", "Zoom", "Estado", "Acción"]}
              data={paginationData.items}
              minWidth="min-w-[680px]"
              containerClass="px-4"
              renderRow={(t) => (
                <>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">{t.review}</td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">{formatDateForTable(t.fecha)}</td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">{t.horario}</td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">{t.sala}</td>
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
                  <td
                    className="border border-[#111827] p-2 text-center dark:border-[#333]"
                    style={{ overflow: "visible" }}
                  >
                    <AlumnoActions
                      tipo="turno"
                      item={t}
                      onCancelarTurno={handleCancelarTurno}
                      disabled={isTurnosSectionLoading || processingTurno === t.id}
                    />
                  </td>
                </>
              )}
            >
              {!hasTurnos && (
                <EmptyRow
                  columns={[
                    "Review",
                    "Fecha",
                    "Horario",
                    "Sala",
                    "Zoom",
                    "Estado",
                    "Acción",
                  ]}
                />
              )}
            </Table>
          )}
        </div>

        {/* Cards Mobile */}
        <div className="mt-4 space-y-4 px-2 sm:hidden">
          {isTurnosSectionLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} height="4.5rem" />
              ))}
            </div>
          ) : hasTurnos ? (
            paginationData.items.map((t) => (
              <CardTurno
                key={t.id}
                turno={t}
                onCancelar={() => handleCancelarTurno(t)}
                disabled={isTurnosSectionLoading || processingTurno === t.id}
              />
            ))
          ) : (
            <EmptyRow.Mobile />
          )}
        </div>

        {!isTurnosSectionLoading && (
          <Pagination
            totalItems={paginationData.totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={paginationData.currentPage}
            onPageChange={setPageMisTurnos}
          />
        )}
      </div>
    </div>
  );
};
