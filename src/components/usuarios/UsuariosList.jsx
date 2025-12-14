// === Usuarios List ===
// Tabla principal para CRUD de usuarios en la vista administrativa.
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAppData } from "../../context/AppContext";
import { useLoading } from "../../context/LoadingContext";
import { useModal } from "../../context/ModalContext";
import { useAuth } from "../../context/AuthContext";
import { Table } from "../ui/Table";
import { Button } from "../ui/Button";
import { Pagination } from "../ui/Pagination";
import { Skeleton } from "../ui/Skeleton";
import { SearchBar } from "../ui/SearchBar";
import { CardUsuario } from "../ui/CardUsuario";
import { DropdownActions } from "../ui/DropdownActions";
import { EmptyRow } from "../ui/EmptyRow";
import { showToast } from "../../utils/feedback/toasts";
import { mapUsuario } from "../../utils/usuarios/helpers";
import { paginate } from "../../utils/pagination";

const USER_TABLE_COLUMNS = ["Nombre", "Tipo", "Email", "Cohorte", "Modulo", "Acciones"];
const ITEMS_PER_PAGE = 8;

const ROLE_LABELS = {
  alumno: "Alumno",
  profesor: "Profesor",
  superadmin: "Superadmin",
};

const ROLE_PERMISSIONS = {
  superadmin: ["alumno", "profesor", "superadmin"],
  profesor: ["alumno"],
};

export const UsuariosList = ({ onCrear, onEditar }) => {
  const { usuarios, loadUsuarios, deleteUsuarioRemoto } = useAppData();
  const { isLoading } = useLoading();
  const { showModal } = useModal();
  const { usuario: sessionUser } = useAuth();

  const [filtered, setFiltered] = useState([]);
  const [page, setPage] = useState(1);
  const [processingId, setProcessingId] = useState(null);

  const loggedRole = String(sessionUser?.rol ?? sessionUser?.role ?? "").toLowerCase();
  
  const allowedRoles = useMemo(() => {
    if (loggedRole === "superadmin") return ROLE_PERMISSIONS.superadmin;
    if (loggedRole === "profesor") return ROLE_PERMISSIONS.profesor;
    return [];
  }, [loggedRole]);

  const canManageUsers = allowedRoles.length > 0;

  useEffect(() => {
    if (canManageUsers) {
      loadUsuarios?.();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManageUsers]);

  const personas = useMemo(
    () => (Array.isArray(usuarios) ? usuarios.map(mapUsuario) : []),
    [usuarios]
  );

  useEffect(() => {
    setFiltered(personas);
    setPage(1);
  }, [personas]);

  const paginated = useMemo(
    () => paginate(filtered, page, ITEMS_PER_PAGE),
    [filtered, page]
  );

  const handleSearch = useCallback((results) => {
    setFiltered(Array.isArray(results) && results.length ? results : personas);
    setPage(1);
  }, [personas]);

  const isBusy =
    Boolean(processingId) ||
    isLoading("usuarios") ||
    isLoading("usuarios-delete");

  const handleEliminar = useCallback((persona) => {
    if (!canManageUsers) {
      showToast("No tienes permisos para eliminar usuarios", "error");
      return;
    }

    const tipo = String(persona.tipo || "alumno").toLowerCase();
    if (!allowedRoles.includes(tipo)) {
      showToast("No puedes eliminar este tipo de usuario", "error");
      return;
    }

    showModal({
      type: "warning",
      title: "Eliminar usuario",
      message: `¿Eliminar a "${persona.nombre}"? Esta acción no se puede deshacer.`,
      onConfirm: async () => {
        setProcessingId(persona.id);
        try {
          await deleteUsuarioRemoto(persona.id);
          showToast("Usuario eliminado correctamente", "success");
          await loadUsuarios?.();
        } catch (error) {
          const message = error?.response?.data?.message || error?.message || "No se pudo eliminar el usuario";
          showToast(message, "error");
        } finally {
          setProcessingId(null);
        }
      },
    });
  }, [canManageUsers, allowedRoles, showModal, deleteUsuarioRemoto, loadUsuarios]);

  if (!canManageUsers) {
    return (
      <section className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-900 dark:border-red-400/40 dark:bg-red-950/30 dark:text-red-100">
        <h1 className="text-2xl font-bold">Acceso no autorizado</h1>
        <p className="mt-2 text-sm">Tu rol actual no permite administrar usuarios.</p>
      </section>
    );
  }

  return (
    <div className="w-full flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2
              data-testid="create-users-heading"
              className="text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]"
            >
            Gestión de Usuarios
          </h2>
          <Button onClick={onCrear} variant="primary" className="w-full sm:w-auto">
            Crear nuevo usuario
          </Button>
        </div>

        <SearchBar
          data={usuarios}
          fields={["nombre", "email", "tipo", "modulo", "cohorte"]}
          onSearch={handleSearch}
          placeholder="Buscar por nombre, email, rol o módulo"
        />

        {/* Vista Desktop - Tabla */}
        <div className="hidden md:block">
          <Table
            columns={USER_TABLE_COLUMNS}
            data={paginated.items}
            containerClass="px-4"
            minWidth="min-w-[680px]"
            isLoading={isBusy}
            renderRow={(persona) => (
              <>
                <td className="border p-2 dark:border-[#333]">{persona.nombre}</td>
                <td className="border p-2 dark:border-[#333] capitalize">
                  {ROLE_LABELS[persona.tipo] ?? persona.tipo}
                </td>
                <td className="border p-2 dark:border-[#333]">{persona.email}</td>
                <td className="border p-2 dark:border-[#333]">{persona.cohorte}</td>
                <td className="border p-2 dark:border-[#333]">{persona.modulo}</td>
                <td className="border p-2 dark:border-[#333] text-right">
                  <div className="flex justify-center">
                    <DropdownActions
                      options={[
                        {
                          label: "Editar",
                          icon: "/icons/edit.png",
                          onClick: () => onEditar(persona),
                          disabled: isBusy,
                        },
                        {
                          label: "Eliminar",
                          icon: "/icons/trash.png",
                          onClick: () => handleEliminar(persona),
                          disabled: isBusy,
                          danger: true,
                        },
                      ]}
                    />
                  </div>
                </td>
              </>
            )}
          >
            {paginated.items.length === 0 && (
              <EmptyRow columns={USER_TABLE_COLUMNS} />
            )}
          </Table>
        </div>

        {/* Vista Mobile - Cards */}
        <div className="space-y-3 md:hidden">
          {isBusy ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} height="8rem" />
            ))
          ) : paginated.items.length === 0 ? (
            <EmptyRow.Mobile message="No hay usuarios para mostrar." />
          ) : (
            paginated.items.map((persona) => (
              <CardUsuario
                key={persona.id}
                usuario={persona}
                onEditar={onEditar}
                onEliminar={handleEliminar}
                disabled={isBusy}
              />
            ))
          )}
        </div>

        {!isBusy && paginated.items.length > 0 && (
          <div className="flex justify-center">
            <Pagination
              currentPage={paginated.currentPage}
              totalItems={paginated.totalItems}
              itemsPerPage={ITEMS_PER_PAGE}
              onPageChange={setPage}
            />
          </div>
        )}
    </div>
  );
};
