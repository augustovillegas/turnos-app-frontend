import { useState, useEffect, useMemo } from "react";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { SearchBar } from "../components/ui/SearchBar";
import { Table } from "../components/ui/Table";

import { useAppData } from "../context/AppContext";
import { Status } from "../components/ui/Status";
import { formatDateForTable } from "../utils/formatDateForTable";
import { Skeleton } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { CardTurno } from "../components/ui/CardTurno";
import { AlumnoActions } from "../components/ui/AlumnoActions";
import { EmptyRow } from "../components/ui/EmptyRow";
import { paginate } from "../utils/pagination";
import { TurnoDetail } from "../components/turnos/TurnoDetail";

const TURNOS_DISPONIBLES_COLUMNS = [
  "Review",
  "Fecha",
  "Horario",
  "Sala",
  "Zoom",
  "Estado",
  "Acciones",
];

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
  const { loadTurnos } = useAppData();
  const [turnosBuscados, setTurnosBuscados] = useState(turnos);
  const [modo, setModo] = useState("listar");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  // Actualizar resultados cuando cambien los turnos
  useEffect(() => {
    setTurnosBuscados(turnos);
    setPageTurnosDisponibles(1); // Reset página cuando cambian turnos
  }, [turnos, setPageTurnosDisponibles]);

  // Resetear página cuando cambia el filtro de review
  useEffect(() => {
    setPageTurnosDisponibles(1);
  }, [filtroReview, setPageTurnosDisponibles]);

  const paginationData = useMemo(
    () => paginate(turnosBuscados, pageTurnosDisponibles, ITEMS_PER_PAGE),
    [turnosBuscados, pageTurnosDisponibles]
  );

  const hasTurnos = paginationData.items.length > 0;

  const onVerDetalle = (turno) => {
    setTurnoSeleccionado(turno);
    setModo("detalle");
  };

  const goListar = () => {
    setModo("listar");
    setTurnoSeleccionado(null);
  };

  if (modo === "detalle") {
    return <TurnoDetail turno={turnoSeleccionado} onVolver={goListar} />;
  }

  return (
    <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Listado de Turnos Disponibles
        </h2>

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
          onSearch={(results) => {
            setTurnosBuscados(results);
            setPageTurnosDisponibles(1);
          }}
        />

        {/* Tabla Desktop */}
        <div className="hidden sm:block">
          <Table
            columns={TURNOS_DISPONIBLES_COLUMNS}
            data={paginationData.items}
            minWidth="min-w-[680px]"
            containerClass="px-4"
            isLoading={isTurnosSectionLoading}
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
                    {t.sala}
                  </td>
                  <td className="border p-2 text-center dark:border-[#333]">
                    {t.zoomLink && (
                      <a href={t.zoomLink} target="_blank" rel="noreferrer" aria-label="Abrir enlace Zoom" role="link">
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
                      onVerDetalle={onVerDetalle}
                      disabled={
                        isTurnosSectionLoading || processingTurno === t.id
                      }
                    />
                  </td>
                </>
              )}
            >
              {paginationData.items.length === 0 && (
                <EmptyRow columns={TURNOS_DISPONIBLES_COLUMNS} />
              )}
            </Table>
        </div>

        {/* Cards Mobile */}
        <div className="mt-4 space-y-4 px-2 sm:hidden">
          {isTurnosSectionLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                <Skeleton key={index} height="4.5rem" />
              ))}
            </div>
          ) : paginationData.items.length === 0 ? (
            <EmptyRow.Mobile message="No hay turnos disponibles." />
          ) : (
            paginationData.items.map((t) => (
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
            totalItems={paginationData.totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={paginationData.currentPage}
            onPageChange={setPageTurnosDisponibles}
          />
        )}
      </div>
    </div>
  );
};
