import { ReviewFilter } from "../components/ui/ReviewFilter";
import { SearchBar } from "../components/ui/SearchBar";
import { Table } from "../components/ui/Table";
import { Status } from "../components/ui/Status";
import { Skeleton } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { CardTurno } from "../components/ui/CardTurno";
import { AlumnoActions } from "../components/ui/AlumnoActions";
import { EmptyRow } from "../components/ui/EmptyRow";

export const TurnosDisponibles = ({
  turnos,
  onSolicitar,
  handleCancelarTurno,
  processingTurno,
  isTurnosSectionLoading,
  filtroReview,
  setFiltroReview,
  pageTurnosDisponibles,
  setPageTurnosDisponibles,
  ITEMS_PER_PAGE,
}) => {
  const totalItems = turnos.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE) || 1;
  const currentPage = Math.min(pageTurnosDisponibles, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginated = turnos.slice(start, start + ITEMS_PER_PAGE);
  const hasTurnos = paginated.length > 0;

  return (
    <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Listado de Turnos Disponibles
          </h2>
        </div>

        <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

        <SearchBar
          data={turnos}
          fields={[
            "sala",
            "fecha",
            "horario",
            "estado",
            "review",
            "comentarios",
          ]}
          placeholder="Buscar turnos disponibles"
          onSearch={() => setPageTurnosDisponibles(1)}
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
                "Acción",
              ]}
              data={paginated}
              minWidth="min-w-[680px]"
              containerClass="px-4"
              renderRow={(t) => (
                <>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.review}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.fecha}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {t.horario}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
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
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    <Status status={t.estado || "Disponible"} />
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    <AlumnoActions
                      tipo="turno"
                      item={t}
                      onSolicitar={onSolicitar}
                      onCancelarTurno={handleCancelarTurno}
                      disabled={
                        isTurnosSectionLoading || processingTurno === t.id
                      }
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
            paginated.map((t) => (
              <CardTurno
                key={t.id}
                turno={t}
                onSolicitar={() => onSolicitar(t)}
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
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setPageTurnosDisponibles}
          />
        )}
      </div>
    </div>
  );
};
