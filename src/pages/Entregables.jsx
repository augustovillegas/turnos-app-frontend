import { useState, useMemo, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { CardEntrega } from "../components/ui/CardEntrega";
import { EntregaForm } from "../components/ui/EntregaForm";
import { SearchBar } from "../components/ui/SearchBar";
import { Pagination } from "../components/ui/Pagination";
import { Status } from "../components/ui/Status";
import { Skeleton } from "../components/ui/Skeleton";
import { EmptyRow } from "../components/ui/EmptyRow";
import { AlumnoActions } from "../components/ui/AlumnoActions";
import { Table } from "../components/ui/Table";

export const Entregables = ({
  entregas = [],
  onAgregarEntrega,
  onCancelarEntrega,
  entregasLoading = false,
}) => {
  const ITEMS_PER_PAGE = 5;

  const [modoEntrega, setModoEntrega] = useState("listar");
  const [sprint, setSprint] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [renderLink, setRenderLink] = useState("");
  const [comentarios, setComentarios] = useState("");
  const [entregaErrors, setEntregaErrors] = useState({});
  const [entregasBuscadas, setEntregasBuscadas] = useState(entregas);
  const [pageEntregas, setPageEntregas] = useState(1);

  // 🔄 Actualizar resultados cuando cambien las entregas
  useEffect(() => setEntregasBuscadas(entregas), [entregas]);

  // 🔢 Paginación
  const totalEntregas = entregasBuscadas.length;
  const paginatedEntregas = useMemo(() => {
    const totalPages = Math.ceil(totalEntregas / ITEMS_PER_PAGE) || 1;
    const currentPage = Math.min(pageEntregas, totalPages);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return {
      items: entregasBuscadas.slice(start, start + ITEMS_PER_PAGE),
      totalItems: totalEntregas,
      totalPages,
      currentPage,
    };
  }, [entregasBuscadas, totalEntregas, pageEntregas]);

  const hasEntregas =
    paginatedEntregas.totalItems > 0 && paginatedEntregas.items.length > 0;

  return (
    <div className="p-6 text-[#111827] dark:text-gray-100 transition-colors duration-300 rounded-lg">
      {/* =========================
          LISTAR ENTREGAS
      ========================== */}
      {modoEntrega === "listar" && (
        <div className="mx-auto flex w-full flex-col gap-6 max-w-full sm:max-w-6xl px-2">
          {/* Encabezado */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-3xl font-bold text-[#1E3A8A] transition-colors duration-300 dark:text-[#93C5FD]">
              Entregables (Trabajos Prácticos)
            </h2>
            <Button
              variant="primary"
              className="w-full md:w-auto px-6 py-2 self-start md:self-auto"
              onClick={() => setModoEntrega("crear")}
            >
              Nueva Entrega
            </Button>
          </div>

          {/* Buscador */}
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
            {entregasLoading ? (
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
                  "Acción",
                ]}
                data={paginatedEntregas.items || []}
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
                      <AlumnoActions
                        tipo="entrega"
                        item={e}
                        onCancelarEntrega={onCancelarEntrega}
                        disabled={entregasLoading}
                      />
                    </td>
                  </>
                )}
              >
                {/* Fila vacía con EmptyRow */}
                {!hasEntregas && (
                  <EmptyRow
                    columns={[
                      "Sprint",
                      "GitHub",
                      "Render",
                      "Comentarios",
                      "Estado",
                      "Acción",
                    ]}
                  />
                )}
              </Table>
            )}
          </div>

          {/* ====== CARDS MOBILE ====== */}
          <div className="mt-4 space-y-4 px-2 sm:hidden">
            {entregasLoading ? (
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
                  onCancelar={() => onCancelarEntrega(entrega)}
                  disabled={entregasLoading}
                />
              ))
            ) : (
              // Recuadro vacío en móviles (mantiene coherencia visual)
              <EmptyRow.Mobile />
            )}
          </div>

          {/* Paginación */}
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
              await onAgregarEntrega({
                sprint,
                githubLink,
                renderLink,
                comentarios,
              });
              setModoEntrega("listar");
            }}
            onVolver={() => setModoEntrega("listar")}
          />
        </div>
      )}
    </div>
  );
};
