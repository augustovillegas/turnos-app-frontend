import { useAppData } from "../context/AppContext";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { Status } from "../components/ui/Status";

export const EvaluarEntregas = () => {
  const { entregas, setEntregas } = useAppData();
 
  const actualizarEstado = (id, nuevoEstado) => {
    const nuevas = entregas.map((e) =>
      e.id === id ? { ...e, estado: nuevoEstado } : e
    );
    setEntregas(nuevas);
  };

  const aprobarEntrega = (id) => actualizarEstado(id, "Aprobado");
  const desaprobarEntrega = (id) => actualizarEstado(id, "Rechazado");

  const entregasPendientes = entregas.filter(
    (e) => e.estado === "Pendiente" || !e.estado
  );

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6">
        Evaluar Entregables
      </h2>

      {/* ---- Versión Desktop ---- */}
      <div className="hidden sm:block">
        <Table
          columns={[
            "Sprint",
            "Alumno",
            "GitHub",
            "Render",
            "Comentarios",
            "Fecha",
            "Estado",
            "Acción",
          ]}
          data={entregasPendientes}
          renderRow={(e) => (
            <>
              <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                Sprint {e.sprint}
              </td>
              <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                {e.alumno || "—"}
              </td>
              <td className="border p-2 text-center dark:border-[#333]">
                {e.githubLink ? (
                  <a
                    href={e.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    GitHub
                  </a>
                ) : (
                  "No entregado"
                )}
              </td>
              <td className="border p-2 text-center dark:border-[#333]">
                {e.renderLink ? (
                  <a
                    href={e.renderLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    Render
                  </a>
                ) : (
                  "No entregado"
                )}
              </td>
              <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                {e.comentarios || "-"}
              </td>
              <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                {e.fechaEntrega || "—"}
              </td>
              <td className="border p-2 text-center dark:border-[#333]">
                <Status status={e.estado || "Pendiente"} />
              </td>
              <td className="border p-2 text-center dark:border-[#333]">
                {(e.estado === "Pendiente" || !e.estado) && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="success"
                      className="py-1"
                      onClick={() => aprobarEntrega(e.id)}
                    >
                      Aprobar
                    </Button>
                    <Button
                      variant="danger"
                      className="py-1"
                      onClick={() => desaprobarEntrega(e.id)}
                    >
                      Desaprobar
                    </Button>
                  </div>
                )}
              </td>
            </>
          )}
        />
      </div>

      {/* ---- Versión Mobile (Cards) ---- */}
      <div className="block sm:hidden space-y-4 mt-4 px-2">
        {entregasPendientes.map((e) => (
          <div
            key={e.id}
            className="bg-white dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] rounded-lg p-4 shadow-md transition-all hover:shadow-lg"
          >
            {/* Encabezado */}
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                Sprint {e.sprint}
              </h3>
              <Status status={e.estado || "Pendiente"} />
            </div>

            {/* Datos principales */}
            <p className="text-sm dark:text-gray-200 mb-1">
              <span className="font-semibold">Alumno:</span>{" "}
              {e.alumno || "Sin asignar"}
            </p>
            {e.fechaEntrega && (
              <p className="text-sm dark:text-gray-200 mb-1">
                <span className="font-semibold">Fecha de entrega:</span>{" "}
                {e.fechaEntrega}
              </p>
            )}
            <p className="text-sm dark:text-gray-200 mb-2">
              <span className="font-semibold">Comentarios:</span>{" "}
              {e.comentarios || "Sin comentarios."}
            </p>

            {/* Enlaces */}
            <div className="mt-2 space-y-1 text-sm">
              <div className="flex items-center gap-2">
                <img
                  src="/icons/github_icon.png"
                  alt="GitHub"
                  className="w-4 h-4"
                />
                {e.githubLink ? (
                  <a
                    href={e.githubLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    Ver repositorio GitHub
                  </a>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No entregado
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <img
                  src="/icons/render_icon.png"
                  alt="Render"
                  className="w-4 h-4"
                />
                {e.renderLink ? (
                  <a
                    href={e.renderLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 underline"
                  >
                    Ver Render Deploy
                  </a>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    No entregado
                  </span>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex justify-end mt-4 gap-2">
              {(e.estado === "Pendiente" || !e.estado) && (
                <>
                  <Button
                    variant="success"
                    className="py-1 text-xs"
                    onClick={() => aprobarEntrega(e.id)}
                  >
                    Aprobar
                  </Button>
                  <Button
                    variant="danger"
                    className="py-1 text-xs"
                    onClick={() => desaprobarEntrega(e.id)}
                  >
                    Desaprobar
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
