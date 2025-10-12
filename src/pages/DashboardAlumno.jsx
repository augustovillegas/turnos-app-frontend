import { useState } from "react";
import { SideBar } from "../components/layout/SideBar";
import { Button } from "../components/ui/Button";
import { Status } from "../components/ui/Status";
import { Table } from "../components/ui/Table";
import { useAppData } from "../context/AppContext";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { CardTurno } from "../components/ui/CardTurno";
import { EntregaForm } from "../components/ui/EntregaForm";
import { CardEntrega } from "../components/ui/CardEntrega";
import { Configuracion } from "./Configuracion";

export const DashboardAlumno = () => {
  // App context
  const { turnos, setTurnos, entregas, setEntregas } = useAppData();

  const [active, setActive] = useState("turnos");
  const [filtroReview, setFiltroReview] = useState("todos");

  const [sprint, setSprint] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [renderLink, setRenderLink] = useState("");
  const [comentarios, setComentarios] = useState("");

  const items = [
    { id: "turnos", label: "Solicitar turnos", icon: "/icons/calendar-1.png" },
    {
      id: "mis-turnos",
      label: "Mis turnos",
      icon: "/icons/directory_explorer-5.png",
    },
    {
      id: "Entregables",
      label: "Entregables",
      icon: "/icons/directory_net_web-4.png",
    },
  ];

  const solicitarTurno = (index) => {
    const nuevosTurnos = [...turnos];
    if (nuevosTurnos[index].estado === "Disponible") {
      nuevosTurnos[index].estado = "Solicitado";
      setTurnos(nuevosTurnos);
    }
  };

  const cancelarTurno = (index) => {
    const nuevosTurnos = [...turnos];
    if (nuevosTurnos[index].estado === "Solicitado") {
      nuevosTurnos[index].estado = "Disponible";
      setTurnos(nuevosTurnos);
    }
  };

  const handleAgregarEntrega = () => {
    if (!githubLink.trim() || !sprint) return;

    const nueva = {
      id: Date.now(),
      sprint,
      githubLink: githubLink.trim(),
      renderLink: renderLink.trim(),
      comentarios: comentarios.trim(),
      reviewStatus: "A revisar",
    };

    setEntregas([...entregas, nueva]);
    setSprint("");
    setGithubLink("");
    setRenderLink("");
    setComentarios("");
  };

  const columns = [
    "Review",
    "Fecha",
    "Horario",
    "Sala",
    "Zoom",
    "Estado",
    "Acción",
  ];
  const columnsMisTurnos = [
    "Review",
    "Fecha",
    "Horario",
    "Sala",
    "Zoom",
    "Estado",
    "Acción",
  ];

  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  const turnosHistorial = aplicarFiltro(
    turnos.filter(
      (t) =>
        t.estado === "Aprobado" ||
        t.estado === "Rechazado" ||
        t.estado === "Solicitado"
    )
  );

  const turnosDisponibles = aplicarFiltro(turnos);

  return (
    <div className="flex min-h-screen bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <SideBar items={items} active={active} onSelect={setActive} />

      <div className="flex-1 p-6">
        {/* =========================
            SECCIÓN: TURNOS DISPONIBLES
        ========================== */}
        {active === "turnos" && (
          <>
            <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6 transition-colors duration-300">
              Listado de Turnos Disponibles
            </h2>
            <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

            {/* Tabla Desktop */}
            <div className="hidden sm:block">
              <Table
                columns={columns}
                data={turnosDisponibles}
                minWidth="min-w-[680px]"
                containerClass="px-4"
                renderRow={(t) => {
                  const indexReal = t.id
                    ? turnos.findIndex((x) => x.id === t.id)
                    : turnos.findIndex((x) => x === t);
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
                        <Status status={t.estado || "Disponible"} />
                      </td>
                      <td className="border p-2 text-center dark:border-[#333]">
                        {t.estado === "Disponible" && (
                          <Button
                            variant="primary"
                            className="py-1"
                            onClick={() => solicitarTurno(indexReal)}
                          >
                            Solicitar turno
                          </Button>
                        )}
                        {t.estado === "Solicitado" && (
                          <Button
                            variant="secondary"
                            className="py-1"
                            onClick={() => cancelarTurno(indexReal)}
                          >
                            Cancelar solicitud
                          </Button>
                        )}
                      </td>
                    </>
                  );
                }}
              />
            </div>

            {/* Tarjetas Mobile */}
            <div className="block sm:hidden space-y-4 mt-4 px-2">
              {turnosDisponibles.map((t) => {
                const indexReal = t.id
                  ? turnos.findIndex((x) => x.id === t.id)
                  : turnos.findIndex((x) => x === t);
                return (
                  <CardTurno
                    key={t.id}
                    turno={t}
                    // La prop CardTurno no está definida, pero mantengo la lógica de llamado
                    onSolicitar={() => solicitarTurno(indexReal)}
                    onCancelar={() => cancelarTurno(indexReal)}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* =========================
            SECCIÓN: MIS TURNOS
        ========================== */}
        {active === "mis-turnos" && (
          <>
            <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6 transition-colors duration-300">
              Mis Turnos
            </h2>

            {/* Tabla Desktop */}
            <div className="hidden sm:block">
              <Table
                columns={columnsMisTurnos}
                data={turnosHistorial}
                minWidth="min-w-[680px]"
                containerClass="px-4"
                renderRow={(t) => (
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
                      <Status status={t.estado || "-"} />
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      {t.estado === "Solicitado" && (
                        <Button
                          variant="secondary"
                          className="py-1"
                          onClick={() => {
                            const indexReal = turnos.findIndex(
                              (x) => x.id === t.id
                            );
                            cancelarTurno(indexReal);
                          }}
                        >
                          Cancelar turno
                        </Button>
                      )}
                    </td>
                  </>
                )}
              />
            </div>

            {/* Tarjetas Mobile */}
            <div className="block sm:hidden space-y-4 mt-4 px-2">
              {turnosHistorial.map((t) => {
                const indexReal = turnos.findIndex((x) => x.id === t.id);
                return (
                  <CardTurno
                    key={t.id}
                    turno={t}
                    onCancelar={() => {
                      const nuevos = [...turnos];
                      if (nuevos[indexReal].estado === "Solicitado") {
                        nuevos[indexReal].estado = "Disponible";
                        setTurnos(nuevos);
                      }
                    }}
                  />
                );
              })}
            </div>
          </>
        )}

        {/* =========================
            SECCIÓN: ENTREGABLES
        ========================== */}
        {active === "Entregables" && (
          <>
            <h2 className="text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-6 transition-colors duration-300">
              Entregables (Trabajos Prácticos)
            </h2>

            {/* ✅ Formulario modularizado */}
            <EntregaForm
              sprint={sprint}
              githubLink={githubLink}
              renderLink={renderLink}
              comentarios={comentarios}
              setSprint={setSprint}
              setGithubLink={setGithubLink}
              setRenderLink={setRenderLink}
              setComentarios={setComentarios}
              onAgregar={handleAgregarEntrega}
            />

            {/* ✅ Versión Desktop: tabla de entregas */}
            <div className="hidden sm:block">
              <Table
                columns={[
                  "Sprint",
                  "GitHub",
                  "Render",
                  "Comentarios",
                  "Estado",
                  "Acción",
                ]}
                data={entregas}
                renderRow={(e) => (
                  <>
                    <td className="border p-2 dark:border-[#333] dark:text-gray-200">
                      {e.sprint}
                    </td>
                    <td className="border p-2 dark:border-[#333]">
                      <a
                        href={e.githubLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {e.githubLink}
                      </a>
                    </td>
                    <td className="border p-2 dark:border-[#333]">
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
                    <td className="border p-2 dark:border-[#333] dark:text-gray-200">
                      {e.comentarios || "-"}
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      <Status status={e.reviewStatus} />
                    </td>
                    <td className="border p-2 text-center dark:border-[#333]">
                      {e.reviewStatus === "A revisar" && (
                        <Button
                          variant="danger"
                          className="py-1"
                          onClick={() => {
                            const nuevas = entregas.filter(
                              (ent) => ent.id !== e.id
                            );
                            setEntregas(nuevas);
                          }}
                        >
                          Cancelar
                        </Button>
                      )}
                    </td>
                  </>
                )}
              />
            </div>

            {/* ✅ Versión Mobile: tarjetas CardEntrega */}
            <div className="block sm:hidden space-y-4 mt-4 px-2">
              {entregas.length === 0 ? (
                <p className="text-sm text-gray-100 dark:text-gray-300 text-center">
                  No hay entregas registradas.
                </p>
              ) : (
                entregas.map((entrega) => (
                  <CardEntrega
                    key={entrega.id}
                    entrega={entrega}
                    onCancelar={() => {
                      const nuevas = entregas.filter(
                        (e) => e.id !== entrega.id
                      );
                      setEntregas(nuevas);
                    }}
                  />
                ))
              )}
            </div>
          </>
        )}

        {/* =========================
            SECCIÓN: CONFIGURACION
        ========================== */}
         {active === "config" && <Configuracion />}
      </div>
    </div>
  );
};
