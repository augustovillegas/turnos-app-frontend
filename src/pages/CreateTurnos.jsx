import { useState } from "react";
import { Button } from "../components/ui/Button";
import { Table } from "../components/ui/Table";
import { Status } from "../components/ui/Status";
import { useAppData } from "../context/AppContext";
import { ReviewFilter } from "../components/ui/ReviewFilter";
import { EditTurnoModal } from "../components/ui/EditTurnoModal";
import { CardTurnosCreados } from "../components/ui/CardTurnosCreados";

export const CreateTurnos = () => {
  const { turnos, setTurnos } = useAppData();
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [review, setReview] = useState(1);
  const [zoomLink, setZoomLink] = useState("");
  const [sala, setSala] = useState("");
  const [filtroReview, setFiltroReview] = useState("todos");
  const [editingTurno, setEditingTurno] = useState(null);

  const generarTurnos = () => {
    if (!fecha || !horaInicio || !horaFin || !zoomLink || !sala) return;

    const [hInicio, mInicio] = horaInicio.split(":").map(Number);
    const [hFin, mFin] = horaFin.split(":").map(Number);

    const inicio = new Date(fecha);
    inicio.setHours(hInicio, mInicio);

    const fin = new Date(fecha);
    fin.setHours(hFin, mFin);

    if (fin <= inicio) return;

    const fechaFormateada = inicio.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const formatoHora = (date) =>
      date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

    const nuevoTurno = {
      id: Date.now(),
      review,
      fecha: fechaFormateada,
      horario: `${formatoHora(inicio)} - ${formatoHora(fin)}`,
      sala,
      zoomLink,
      estado: "Disponible",
      start: inicio.toISOString(),
      end: fin.toISOString(),
    };

    setTurnos([...turnos, nuevoTurno]);

    // limpiar
    setFecha("");
    setHoraInicio("");
    setHoraFin("");
    setZoomLink("");
    setSala("");
  };

  const handleEdit = (index) => {
    setEditingTurno({ ...turnos[index], index });
  };

  const handleSaveEdit = (updated) => {
    const nuevos = [...turnos];
    nuevos[editingTurno.index] = updated;
    setTurnos(nuevos);
    setEditingTurno(null);
  };

  const cancelarTurno = (index) => {
    const nuevos = [...turnos];
    nuevos[index].estado = "Disponible";
    setTurnos(nuevos);
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

  const aplicarFiltro = (lista) => {
    if (filtroReview === "todos") return lista;
    return lista.filter((t) => t.review === Number(filtroReview));
  };

  const turnosFiltrados = aplicarFiltro(turnos);

  return (
    <div className="min-h-screen bg-[#017F82] dark:bg-[#0F3D3F] p-4 sm:p-6 transition-colors duration-300">
      <h2 className="text-xl sm:text-2xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] mb-4 sm:mb-6 transition-colors duration-300">
        Crear Turnos
      </h2>

      {/* Formulario responsive */}
      <div className="bg-white dark:bg-[#1E1E1E] p-4 border-2 border-[#111827] dark:border-[#333] rounded-md mb-6 transition-colors duration-300">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-1 dark:text-gray-200">
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full border dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 dark:text-gray-200">
              Hora inicio
            </label>
            <input
              type="time"
              value={horaInicio}
              onChange={(e) => setHoraInicio(e.target.value)}
              className="w-full border dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 dark:text-gray-200">
              Hora fin
            </label>
            <input
              type="time"
              value={horaFin}
              onChange={(e) => setHoraFin(e.target.value)}
              className="w-full border dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded transition-colors duration-300"
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 dark:text-gray-200">
              Review
            </label>
            <select
              value={review}
              onChange={(e) => setReview(Number(e.target.value))}
              className="w-full border dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded transition-colors duration-300"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold mb-1 dark:text-gray-200">
              Sala
            </label>
            <select
              value={sala}
              onChange={(e) => setSala(e.target.value)}
              className="w-full border dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded max-h-32 overflow-y-auto transition-colors duration-300"
            >
              <option value="">Seleccionar sala</option>
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={`Sala ${i + 1}`}>
                  Sala {i + 1}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-bold mb-1 dark:text-gray-200">
              Link de Zoom
            </label>
            <input
              type="url"
              value={zoomLink}
              onChange={(e) => setZoomLink(e.target.value)}
              placeholder="https://zoom.us/..."
              className="w-full border dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded transition-colors duration-300"
            />
          </div>
        </div>

        <div className="mt-4">
          <Button
            variant="primary"
            className="py-2 w-full sm:w-auto"
            onClick={generarTurnos}
          >
            Generar turnos
          </Button>
        </div>
      </div>

      {/* Filtro Review */}
      <ReviewFilter value={filtroReview} onChange={setFiltroReview} />

      {/* Desktop: Tabla tradicional */}
      <div className="hidden sm:block px-4">
        <Table
          columns={columns}
          data={turnosFiltrados}
          renderRow={(t) => {
            const indexReal = turnos.findIndex((x) => x.id === t.id);
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
                <td className="border border-[#111827] dark:border-[#333] p-2 text-center">
                  <Status status={t.estado} />
                </td>
                <td className="border border-[#111827] dark:border-[#333] p-2 text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="secondary"
                      onClick={() => handleEdit(indexReal)}
                    >
                      Editar
                    </Button>

                    {t.estado === "Disponible" ? (
                      <Button
                        variant="danger"
                        onClick={() => {
                          const nuevos = [...turnos];
                          nuevos.splice(indexReal, 1);
                          setTurnos(nuevos);
                        }}
                      >
                        Eliminar
                      </Button>
                    ) : (
                      <Button onClick={() => cancelarTurno(indexReal)}>
                        Cancelar
                      </Button>
                    )}
                  </div>
                </td>
              </>
            );
          }}
        />
      </div>

      {/* Mobile: Cards estilo “tabla en tarjetas” */}
      <div className="block sm:hidden space-y-4 mt-4 px-2">
        {turnosFiltrados.map((t) => {
          const indexReal = turnos.findIndex((x) => x.id === t.id);
          return (
            <CardTurnosCreados
              key={t.id}
              turno={t}
              onEditar={() => handleEdit(indexReal)}
              onEliminar={() => {
                const nuevos = [...turnos];
                nuevos.splice(indexReal, 1);
                setTurnos(nuevos);
              }}
              onCancelarAccion={() => cancelarTurno(indexReal)}
            />
          );
        })}
      </div>

      {editingTurno && (
        <EditTurnoModal
          turno={editingTurno}
          onClose={() => setEditingTurno(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
};
