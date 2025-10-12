import { useState } from "react";
import { SideBar } from "../components/layout/SideBar";
import { Table } from "../components/ui/Table";
import { Button } from "../components/ui/Button";
import { CreateTurnos } from "./CreateTurnos";
import { Status } from "../components/ui/Status";
import { useAppData } from "../context/AppContext";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { CardTurno } from "../components/ui/CardTurno";
import { EvaluarEntregas } from "./EvaluarEntregas";
import { Configuracion } from "./Configuracion";

export const DashboardProfesor = () => {
  // App context
  const { turnos, setTurnos, usuarios, setUsuarios } = useAppData();

  const [active, setActive] = useState("solicitudes");
  const [filtroReview, setFiltroReview] = useState("todos");

  // ---- Funciones de gestión de turnos ----
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

  // ---- Gestión de usuarios ----
  const aprobarUsuario = (index) => {
    const nuevos = [...usuarios];
    nuevos[index].estado = "Aprobado";
    setUsuarios(nuevos);
  };

  const usuariosPendientes = usuarios.filter((u) => u.estado === "Pendiente");

  // ---- Filtro por review ----
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
            id: "solicitudes",
            label: "Solicitudes Pendientes",
            icon: "/icons/calendar-1.png",
          },
          {
            id: "usuarios",
            label: "Usuarios Pendientes",
            icon: "/icons/users_key-4.png",
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
            SECCIÓN: SOLICITUDES
        ========================== */}
        {active === "solicitudes" && (
          <>
            <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6">
              Solicitudes de Turnos
            </h2>

            <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

            {/* ---- Desktop (tabla) ---- */}
            <div className="hidden sm:block">
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
                  const indexReal = turnos.findIndex((x) => x.id === t.id);
                  return (
                    <>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                        {t.review}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                        {t.fecha}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                        {t.horario}
                      </td>
                      <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
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
                      <td className="border p-2 text-center dark:border-[#333]">
                        <Status status={t.estado} />
                      </td>
                      <td className="border p-2 text-center dark:border-[#333]">
                        {t.estado === "Solicitado" && (
                          <div className="flex justify-center gap-2">
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
            </div>

            {/* ---- Mobile (tarjetas) ---- */}
            <div className="block sm:hidden space-y-4 mt-4 px-2">
              {turnosSolicitados.map((t) => {
                const indexReal = turnos.findIndex((x) => x.id === t.id);
                return (
                  <CardTurno
                    key={t.id}
                    turno={t}
                    onAprobar={() => aprobarTurno(indexReal)}
                    onRechazar={() => rechazarTurno(indexReal)}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* =========================
            SECCIÓN: SOLICITUD ALUMNOS
        ========================== */}
        {active === "usuarios" && (
          <>
            <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6">
              Usuarios Pendientes
            </h2>

            <Table
              columns={["Nombre", "Rol", "Estado", "Acción"]}
              data={usuariosPendientes}
              renderRow={(u) => {
                const indexReal = usuarios.findIndex((x) => x === u);
                return (
                  <>
                    <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                      {u.nombre}
                    </td>
                    <td className="border p-2 text-center dark:border-[#333] dark:text-gray-200">
                      {u.rol}
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      <Status status={u.estado} />
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      <Button
                        variant="success"
                        className="py-1"
                        onClick={() => aprobarUsuario(indexReal)}
                      >
                        Aprobar usuario
                      </Button>
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
