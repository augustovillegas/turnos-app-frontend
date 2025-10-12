import { useState } from "react";
import { SideBar } from "../components/layout/SideBar";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { CreateTurnos } from "./CreateTurnos";
import { Status } from "../components/ui/Status";
import { useAppData } from "../context/AppContext";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { EvaluarEntregas } from "./EvaluarEntregas";
import { Configuracion } from "./Configuracion";

export const DashboardSuperadmin = () => {
  // App context
  const { turnos, setTurnos, usuarios, setUsuarios } = useAppData();

  const [active, setActive] = useState("usuarios");
  const [filtroReview, setFiltroReview] = useState("todos");

  const aprobarTurno = (index) => {
    const nuevos = [...turnos];
    nuevos[index].estado = "Aprobado";
    setTurnos(nuevos);
  };

  const rechazarTurno = (index) => {
    const nuevos = [...turnos];
    nuevos[index].estado = "Rechazado";
    setTurnos(nuevos);
  };

  const aprobarUsuario = (index) => {
    const nuevos = [...usuarios];
    nuevos[index].estado = "Aprobado";
    setUsuarios(nuevos);
  };

  const usuariosPendientes = usuarios.filter((u) => u.estado === "Pendiente");

  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  const turnosSolicitados = aplicarFiltro(
    turnos.filter((t) => t.estado === "Solicitado")
  );

  return (
    <div className="flex min-h-screen bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <SideBar
        items={[
          {
            id: "usuarios",
            label: "Gestión de Usuarios",
            icon: "/icons/users_key-4.png",
          },
          {
            id: "turnos",
            label: "Solicitudes de Turnos",
            icon: "/icons/calendar-1.png",
          },
          {
            id: "crear-turnos",
            label: "Crear Turnos",
            icon: "/icons/directory_explorer-5.png",
          },
          {
            id: "evaluar-entregas",
            label: "Evaluar Entregables",
            icon: "/icons/briefcase-4.png",
          },
        ]}
        active={active}
        onSelect={setActive}
      />

      <div className="flex-1 p-6">
        {/* =========================
            SECCIÓN: TURNOS SOLICITADOS
        ========================== */}
        {active === "turnos" && (
          <>
            <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6 transition-colors duration-300">
              Solicitudes de Turnos
            </h2>

            {/* Filtro Review */}
            <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

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
              data={turnosSolicitados}
              renderRow={(t) => {
                const indexReal = t.id
                  ? turnos.findIndex((x) => x.id === t.id)
                  : turnos.findIndex((x) => x === t);
                return (
                  <>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center dark:text-gray-200">
                      {t.review}
                    </td>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center dark:text-gray-200">
                      {t.fecha}
                    </td>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center dark:text-gray-200">
                      {t.horario}
                    </td>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center dark:text-gray-200">
                      {t.sala}
                    </td>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center">
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
                    <td className="border p-2 text-center dark:border-[#333]">
                      <Status status={t.estado} />
                    </td>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center">
                      {t.estado === "Solicitado" && (
                        <div className="flex justify-center items-center gap-2">
                          <Button
                            variant="success"
                            className="py-1"
                            onClick={() => aprobarTurno(indexReal)}
                          >
                            Aprobar
                          </Button>
                          <Button
                            variant="danger"
                            className="py-1"
                            onClick={() => rechazarTurno(indexReal)}
                          >
                            Rechazar
                          </Button>
                        </div>
                      )}
                    </td>
                  </>
                );
              }}
            />
          </>
        )}

        {/* =========================
            SECCIÓN: GESTION USUARIOS
        ========================== */}
        {active === "usuarios" && (
          <>
            <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6 transition-colors duration-300">
              Usuarios Pendientes
            </h2>
            <Table
              columns={["Nombre", "Rol", "Estado", "Acción"]}
              data={usuariosPendientes}
              renderRow={(u) => {
                const indexReal = usuarios.findIndex((x) => x === u);
                return (
                  <>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center dark:text-gray-200">
                      {u.nombre}
                    </td>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center dark:text-gray-200">
                      {u.rol}
                    </td>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center">
                      <Status status={u.estado} />
                    </td>
                    <td className="border border-[#111827] dark:border-[#333] p-2 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Button
                          variant="success"
                          className="py-1"
                          onClick={() => aprobarUsuario(indexReal)}
                        >
                          Aprobar
                        </Button>
                        <Button
                          variant="danger"
                          className="py-1"
                          onClick={() => {
                            const nuevos = [...usuarios];
                            nuevos[indexReal].estado = "Rechazado";
                            setUsuarios(nuevos);
                          }}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </td>
                  </>
                );
              }}
            />
          </>
        )}

        {/* =========================
            SECCIÓN: CREAR TURNOS
        ========================== */}
        {active === "crear-turnos" && <CreateTurnos />}

        {/* =========================
            SECCIÓN: EVALUAR ENTREGAS
        ========================== */}
        {active === "evaluar-entregas" && <EvaluarEntregas />}

        {/* =========================
            SECCIÓN: CONFIGURACION
        ========================== */}
        {active === "config" && <Configuracion />}
      </div>
    </div>
  );
};
