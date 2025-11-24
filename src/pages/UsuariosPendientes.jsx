// === Seccion: Usuarios Pendientes (para DashboardProfesor) ===
import { useEffect, useMemo, useState } from "react";
import { Table } from "../components/ui/Table";
import { Status } from "../components/ui/Status";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { Pagination } from "../components/ui/Pagination";
import { SearchBar } from "../components/ui/SearchBar";
import { SuperadminActions } from "../components/ui/SuperadminActions";
import { useAuth } from "../context/AuthContext";
import { useAppData } from "../context/AppContext";
import { usePagination } from "../hooks/usePagination";
import { useApproval } from "../hooks/useApproval";
import { EmptyRow } from "../components/ui/EmptyRow";
import { ProfesorActions } from "../components/ui/ProfesorActions";
import { UsuarioDetail } from "../components/usuarios/UsuarioDetail";

const USUARIOS_PENDIENTES_COLUMNS = ["Nombre", "Rol", "Estado", "Acciones"];

export const UsuariosPendientes = ({ usuarios = [], isLoading }) => {
  const { approveUsuario, updateUsuarioEstado, loadUsuarios } = useAppData();
  const { usuario: usuarioActual } = useAuth();
  const isSuperadmin = usuarioActual?.role === "superadmin";

  const [usuariosBuscados, setUsuariosBuscados] = useState([]);
  const [modo, setModo] = useState("listar");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);
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

  // Hook de rechazo
  const { handleReject, processingId: processingRejectId } = useApproval({
    onApprove: async (usuario) => {
      await updateUsuarioEstado(usuario.id, "Rechazado");
    },
    messages: {
      approveTitle: "Rechazar usuario",
      approveMessage: "¿Confirmar rechazo de {name}?",
      approveSuccess: "Usuario rechazado",
      approveError: "Error al rechazar usuario",
    },
  });

  const handleAprobar = handleApprove;
  const handleRechazar = handleReject;
  const processingUsuarioId = processingId || processingRejectId;

  const onVer = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setModo("detalle");
  };

  const goListar = () => {
    setModo("listar");
    setUsuarioSeleccionado(null);
  };

  if (modo === "detalle") {
    return <UsuarioDetail usuario={usuarioSeleccionado} onVolver={goListar} />;
  }

  return (
    <div className="p-4 sm:p-6 text-[#111827] transition-colors duration-300 dark:text-gray-100 rounded-lg">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
          Usuarios Pendientes
        </h2>

        <SearchBar
          data={usuariosPendientes}
          fields={["nombre", "rol", "estado"]}
          placeholder="Buscar usuarios pendientes"
          onSearch={(results) => {
            setUsuariosBuscados(results);
          }}
        />

        {/* Tabla Desktop */}
        <div className="hidden md:block">
          <Table
            columns={USUARIOS_PENDIENTES_COLUMNS}
            data={paginated.items}
            minWidth="min-w-[680px]"
            containerClass="px-4"
            isLoading={isLoading}
            renderRow={(u) => (
                <>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {u.nombre}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {u.rol}
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    <Status status={u.estado} />
                  </td>
                  <td className="border border-[#111827] p-2 text-center dark:border-[#333]">
                    {isSuperadmin ? (
                      <SuperadminActions
                        item={u}
                        disabled={isLoading || processingUsuarioId === u.id}
                        onAprobar={handleAprobar}
                        onRechazar={handleRechazar}
                        onVer={onVer}
                      />
                    ) : (
                      <ProfesorActions
                        item={u}
                        disabled={isLoading || processingUsuarioId === u.id}
                        onAprobarUsuario={handleAprobar}
                        onRechazarUsuario={handleRechazar}
                        onVer={onVer}
                      />
                    )}
                  </td>
                </>
              )}
            >
              {paginated.items.length === 0 && (
                <EmptyRow columns={USUARIOS_PENDIENTES_COLUMNS} />
              )}
            </Table>
        </div>

        {/* Mobile */}
        <div className="mt-4 space-y-4 px-2 md:hidden">
          {isLoading ? (
            <div className="space-y-3 py-4">
              {Array.from({ length: ITEMS_PER_PAGE }).map((_, index) => (
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
                  <div>
                    <h3 className="text-base font-semibold text-[#1E3A8A] dark:text-[#93C5FD]">
                      {u.nombre}
                    </h3>
                    <p className="text-sm text-[#111827] dark:text-gray-200">
                      <strong>Rol:</strong> {u.rol}
                    </p>
                  </div>
                  <Status status={u.estado} />
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    variant="secondary"
                    className="w-full py-1"
                    onClick={() => onVer(u)}
                    disabled={isLoading || processingUsuarioId === u.id}
                  >
                    Ver detalle
                  </Button>
                  <Button
                    variant="success"
                    className="w-full py-1"
                    onClick={() => handleAprobar(u)}
                    disabled={isLoading || processingUsuarioId === u.id}
                  >
                    Aprobar usuario
                  </Button>
                  <Button
                    variant="danger"
                    className="w-full py-1"
                    onClick={() => handleRechazar(u)}
                    disabled={isLoading || processingUsuarioId === u.id}
                  >
                    Rechazar usuario
                  </Button>
                </div>
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
