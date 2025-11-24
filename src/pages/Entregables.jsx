import { useState, useMemo, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { CardEntrega } from "../components/ui/CardEntrega";
import { EntregaForm } from "../components/ui/EntregaForm";
import { SearchBar } from "../components/ui/SearchBar";
import { Pagination } from "../components/ui/Pagination";

import { useAppData } from "../context/AppContext";
import { Status } from "../components/ui/Status";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyRow } from "../components/ui/EmptyRow";
import { AlumnoActions } from "../components/ui/AlumnoActions";
import { Table } from "../components/ui/Table";
import { EntregaEdit } from "../components/ui/EntregaEdit";
import { EntregaDetail } from "../components/entregas/EntregaDetail";
import { extractFormErrors } from "../utils/feedback/errorExtractor";
import { paginate } from "../utils/pagination";
const ENTREGABLES_COLUMNS = ["Sprint", "GitHub", "Render", "Comentarios", "Estado", "Acciones"];

export const Entregables = ({
  entregas = [],
  onAgregarEntrega,
  onCancelarEntrega,
  entregasLoading = false,
}) => {
  const { loadEntregas } = useAppData();
  const ITEMS_PER_PAGE = 5;

  const [modoEntrega, setModoEntrega] = useState("listar");
  const [sprint, setSprint] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [renderLink, setRenderLink] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [entregaErrors, setEntregaErrors] = useState({});
  const [entregasBuscadas, setEntregasBuscadas] = useState(entregas);
  const [pageEntregas, setPageEntregas] = useState(1);
  const [entregaSeleccionada, setEntregaSeleccionada] = useState(null);

  // 🔄 Actualizar resultados cuando cambien las entregas
  useEffect(() => {
    setEntregasBuscadas(entregas);
    setPageEntregas(1); // Reset página cuando cambian entregas
  }, [entregas]);

  // 🔢 Paginación usando utilidad centralizada
  const paginatedEntregas = useMemo(
    () => paginate(entregasBuscadas, pageEntregas, ITEMS_PER_PAGE),
    [entregasBuscadas, pageEntregas]
  );

  const hasEntregas =
    paginatedEntregas.totalItems > 0 && paginatedEntregas.items.length > 0;

  return (
    <div className="p-6 text-[#111827] dark:text-gray-100 transition-colors duration-300 rounded-lg">
      {/* =========================
          LISTAR ENTREGAS
      ========================== */}
      {modoEntrega === "listar" && (
        <div className="mx-auto flex w-full flex-col gap-6 max-w-full sm:max-w-6xl px-2">
          <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Entregables (Trabajos Prácticos)
          </h2>

          {/* Buscador */}
          <SearchBar
            data={entregas}
            fields={[
              "sprint",
              "alumno",
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
            {entregasLoading ? (
              <div className="space-y-3 py-6">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <Skeleton key={index} height="2.75rem" />
                ))}
              </div>
            ) : (
              <Table
                columns={ENTREGABLES_COLUMNS}
                data={paginatedEntregas.items || []}
                minWidth="min-w-[680px]"
                containerClass="px-4"
                renderRow={(e) => (
                  <>
                    <td className="border p-2 text-center dark:border-[#333]">
                      {e.sprint}
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      <a
                        href={e.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 underline dark:text-blue-400"
                      >
                        {e.githubLink}
                      </a>
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      {e.renderLink ? (
                        <a
                          href={e.renderLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 underline dark:text-blue-400"
                        >
                          {e.renderLink}
                        </a>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      {e.comentarios || "-"}
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      <Status status={e.reviewStatus} />
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      <AlumnoActions
                        tipo="entrega"
                        item={e}
                        onCancelarEntrega={onCancelarEntrega}
                        onEditarEntrega={() => {
                          setEntregaSeleccionada(e);
                          setModoEntrega("editar");
                        }}
                        onVerDetalle={() => {
                          setEntregaSeleccionada(e);
                          setModoEntrega("detalle");
                        }}
                        disabled={entregasLoading}
                      />
                    </td>
                  </>
                )}
              >
                {!hasEntregas && (
                  <EmptyRow columns={ENTREGABLES_COLUMNS} />
                )}
              </Table>
            )}
          </div>

          {/* ====== CARDS MOBILE ====== */}
          <div className="mt-4 space-y-4 px-2 sm:hidden">
            {entregasLoading ? (
              <div className="space-y-3 py-4">
                {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
                  <Skeleton key={index} height="4.5rem" />
                ))}
              </div>
            ) : hasEntregas ? (
              paginatedEntregas.items.map((entrega) => (
                <CardEntrega
                  key={entrega.id}
                  entrega={entrega}
                  onCancelar={() => onCancelarEntrega(entrega)}
                  onEditar={() => {
                    setEntregaSeleccionada(entrega); // 🔹 agregado
                    setModoEntrega("editar"); // 🔹 agregado
                  }}
                  disabled={entregasLoading}
                />
              ))
            ) : (
              <EmptyRow.Mobile />
            )}
          </div>

          <Pagination
            totalItems={paginatedEntregas.totalItems || 0}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={paginatedEntregas.currentPage || 1}
            onPageChange={setPageEntregas}
          />
        </div>
      )}

      {/* =========================
          FORMULARIO DE NUEVA ENTREGA
      ========================== */}
      {modoEntrega === "crear" && (
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
          {/* Cabecera */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
              Nueva Entrega
            </h2>
          </div>

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
            onAgregar={async () => {
              try {
                setEntregaErrors({}); // Limpiar errores previos
                await onAgregarEntrega({
                  sprint,
                  githubLink,
                  renderLink,
                  comentarios,
                });
                setModoEntrega("listar");
              } catch (error) {
                // Extraer errores de validación del backend según contrato {message, errores?}
                const formErrors = extractFormErrors(error);
                setEntregaErrors(formErrors);
              }
            }}
            onVolver={() => setModoEntrega("listar")}
          />
        </div>
      )}

      {/* =========================
          FORMULARIO DE EDICIÓN
      ========================== */}
      {modoEntrega === "editar" && entregaSeleccionada && (
        <EntregaEdit
          entrega={entregaSeleccionada}
          onVolver={() => {
            setModoEntrega("listar");
            setEntregaSeleccionada(null);
          }}
        />
      )}

      {/* =========================
          DETALLE DE ENTREGA
      ========================== */}
      {modoEntrega === "detalle" && entregaSeleccionada && (
        <EntregaDetail
          entrega={entregaSeleccionada}
          onVolver={() => {
            setModoEntrega("listar");
            setEntregaSeleccionada(null);
          }}
        />
      )}
    </div>
  );
};
