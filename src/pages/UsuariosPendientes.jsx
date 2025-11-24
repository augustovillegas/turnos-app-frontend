// === Seccion: Usuarios Pendientes (para DashboardProfesor) ===
import { useEffect, useMemo, useState } from "react";
import { Table } from "../components/ui/Table";
import { Status } from "../components/ui/Status";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { ListToolbar } from "../components/ui/ListToolbar";
import { SearchBar } from "../components/ui/SearchBar";
import { useAppData } from "../context/AppContext";
import { usePagination } from "../hooks/usePagination";
import { useApproval } from "../hooks/useApproval";
import { EmptyRow } from "../components/ui/EmptyRow";

export const UsuariosPendientes = ({ usuarios = [], isLoading }) => {
  const { approveUsuario, loadUsuarios } = useAppData();

  const [usuariosBuscados, setUsuariosBuscados] = useState([]);
  const ITEMS_PER_PAGE = 5;

  const usuariosPendientes = useMemo(
    () =>
      usuarios.filter(
        (u) => String(u.estado || u.status).toLowerCase() === "pendiente"
      ),
    [usuarios]
  );

  useEffect(() => {
    setUsuariosBuscados(usuariosPendientes);
  }, [usuariosPendientes]);

  // Hook de paginación
  const paginated = usePagination(usuariosBuscados, ITEMS_PER_PAGE);

  // Hook de aprobación
  const { handleApprove, processingId } = useApproval({
    onApprove: async (usuario) => {
      await approveUsuario(usuario.id);
    },
    messages: {
      approveTitle: "Aprobar usuario",
      approveMessage: "¿Confirmar aprobación de {name}?",
      approveSuccess: "Usuario aprobado",
      approveError: "Error al aprobar usuario",
    },
  });

  const handleAprobar = handleApprove;

  return (
    <div className="p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <ListToolbar
          title="Usuarios Pendientes"
          total={Array.isArray(usuarios) ? usuarios.length : 0}
          filtered={usuariosPendientes.length}
          loading={isLoading}
          onRefresh={() => loadUsuarios?.()}
          currentPage={paginated.currentPage}
          totalPages={paginated.totalPages}
        />

        <SearchBar
          data={usuariosPendientes}
          fields={["nombre", "rol", "estado"]}
          placeholder="Buscar usuarios pendientes"
          onSearch={(results) => {
            setUsuariosBuscados(results);
          }}
        />

        {/* Desktop */}
        <div className="hidden sm:block">
          {isLoading ? (
            <div className="space-y-3 py-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} height="2.75rem" />
              ))}
            </div>
          ) : (
            <Table
              columns={["Nombre", "Rol", "Estado", "Acción"]}
              data={paginated.items}
              minWidth="min-w-[680px]"
              containerClass="px-4"
              renderRow={(u) => (
                <>
                  <td className="border p-2 text-center">{u.nombre}</td>
                  <td className="border p-2 text-center">{u.rol}</td>
                  <td className="border p-2 text-center">
                    <Status status={u.estado} />
                  </td>
                  <td className="border p-2 text-center">
                    <Button
                      variant="success"
                      className="py-1"
                      onClick={() => handleAprobar(u)}
                      disabled={isLoading || processingId === u.id}
                    >
                      Aprobar usuario
                    </Button>
                  </td>
                </>
              )}
            >
              {!paginated.items.length && (
                <EmptyRow columns={["Nombre", "Rol", "Estado", "Acción"]} />
              )}
            </Table>
          )}
        </div>

        {/* Mobile */}
        <div className="mt-4 space-y-4 px-2 sm:hidden">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} height="4.5rem" />
              ))}
            </div>
          ) : paginated.items.length > 0 ? (
            paginated.items.map((u, idx) => (
              <div
                key={u.id || `${u.nombre}-${idx}`}
                className="space-y-2 rounded-md border-2 border-[#111827] bg-white p-4 shadow-md dark:border-[#333] dark:bg-[#1E1E1E]"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-base font-semibold text-[#1E3A8A] dark:text-[#93C5FD]">
                    {u.nombre}
                  </h3>
                  <Status status={u.estado} />
                </div>
                <p className="text-sm text-[#111827] dark:text-gray-200">
                  <strong>Rol:</strong> {u.rol}
                </p>
                <Button
                  variant="success"
                  className="w-full py-1"
                  onClick={() => handleAprobar(u)}
                  disabled={isLoading || processingId === u.id}
                >
                  Aprobar usuario
                </Button>
              </div>
            ))
          ) : (
            <EmptyRow.Mobile message="No hay usuarios pendientes." />
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
      </div>
    </div>
  );
};
