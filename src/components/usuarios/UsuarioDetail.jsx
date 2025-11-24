// === Usuario Detail ===
// Vista de solo lectura para mostrar la información completa de un usuario.
import { useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { Status } from "../ui/Status";
import { showToast } from "../../utils/feedback/toasts";
import { ensureModuleLabel, labelToModule } from "../../utils/moduleMap";

export const UsuarioDetail = ({ usuario, onVolver }) => {
  const [currentUsuario, setCurrentUsuario] = useState(usuario ?? null);

  useEffect(() => {
    if (!usuario) return;
    setCurrentUsuario(usuario);
  }, [usuario]);

  if (!currentUsuario) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#017F82] p-6 dark:bg-[#0F3D3F]">
        <p className="rounded-md border-2 border-[#1E3A8A] bg-white px-4 py-2 font-semibold text-[#1E3A8A] dark:border-[#93C5FD] dark:bg-[#1E1E1E] dark:text-[#93C5FD]">
          Sin datos disponibles.
        </p>
      </div>
    );
  }

  const ROLE_LABELS = {
    alumno: "Alumno",
    profesor: "Profesor",
    superadmin: "Superadmin",
  };

  const resolveModuleLabel = (user) => {
    if (!user) return null;
    const candidates = [
      user.modulo,
      user.module,
      user.moduleLabel,
      user.moduloSlug,
      user.moduleCode,
      user.moduleNumber,
      user.datos?.modulo,
      user.datos?.module,
    ];
    return candidates.map(ensureModuleLabel).find(Boolean) || null;
  };

  const resolveCohort = (user) => {
    if (!user) return null;
    const candidates = [
      user.cohorte,
      user.cohort,
      user.cohortId,
      user.moduleNumber,
      user.moduleCode,
      user.datos?.cohort,
    ];
    for (const value of candidates) {
      if (value == null) continue;
      const numeric = Number(String(value).trim());
      if (Number.isFinite(numeric)) return Math.trunc(numeric);
      const fromLabel = labelToModule(value);
      if (fromLabel != null) return fromLabel;
    }
    return null;
  };

  const moduleLabel = resolveModuleLabel(currentUsuario);
  const cohortNumber = resolveCohort(currentUsuario);

  return (
    <div className="min-h-screen bg-[#017F82] p-4 sm:p-6 text-[#111827] transition-colors duration-300 dark:bg-[#0F3D3F] dark:text-gray-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
        <Button variant="secondary" onClick={() => onVolver?.()} className="w-fit">
          Volver
        </Button>

        <div className="rounded-md border-2 border-[#111827] bg-white p-6 shadow-lg dark:border-[#333] dark:bg-[#1E1E1E]">
          <h1 className="mb-2 text-2xl sm:text-3xl font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
            Detalle del usuario
          </h1>
          <p className="text-sm text-[#4B5563] dark:text-gray-300">
            Información sincronizada con el backend.
          </p>

          <dl className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Nombre
              </dt>
              <dd className="text-lg font-semibold">{currentUsuario.nombre || currentUsuario.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Email
              </dt>
              <dd className="text-lg font-semibold">{currentUsuario.email}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Rol
              </dt>
              <dd className="text-lg font-semibold capitalize">
                {ROLE_LABELS[currentUsuario.tipo || currentUsuario.rol || currentUsuario.role] || currentUsuario.tipo || currentUsuario.rol}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Estado
              </dt>
              <dd className="mt-1">
                <Status status={currentUsuario.estado || currentUsuario.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Módulo
              </dt>
              <dd className="text-lg font-semibold">{moduleLabel || "N/A"}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                Cohorte
              </dt>
              <dd className="text-lg font-semibold">{cohortNumber ?? "N/A"}</dd>
            </div>
            {currentUsuario.identificador && (
              <div>
                <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                  Identificador
                </dt>
                <dd className="text-lg font-semibold">{currentUsuario.identificador}</dd>
              </div>
            )}
            {(currentUsuario.creador || currentUsuario.creadorId) && (
              <div>
                <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                  Creado por
                </dt>
                <dd className="text-lg font-semibold">{currentUsuario.creador || `ID: ${currentUsuario.creadorId}`}</dd>
              </div>
            )}
            {currentUsuario.id && (
              <div className="md:col-span-2">
                <dt className="text-xs font-semibold uppercase text-[#6B7280]">
                  ID del Sistema
                </dt>
                <dd className="text-sm font-mono text-[#6B7280]">{currentUsuario.id || currentUsuario._id}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};
