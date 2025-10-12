import { useState, useEffect } from "react";
import { Button } from "./Button";

export const EditTurnoModal = ({ turno, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    fecha: "",
    horaInicio: "",
    horaFin: "",
    sala: "",
    zoomLink: "",
  });

  useEffect(() => {
    if (turno) {
      const [inicio, fin] = turno.horario?.split(" - ") || ["", ""];
      setFormData({
        fecha: turno.fecha?.split("/").reverse().join("-") || "",
        horaInicio: inicio?.slice(0, 5) || "",
        horaFin: fin?.slice(0, 5) || "",
        sala: turno.sala || "",
        zoomLink: turno.zoomLink || "",
      });
    }
  }, [turno]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSave = () => {
    const { fecha, horaInicio, horaFin, sala, zoomLink } = formData;
    if (!fecha || !horaInicio || !horaFin || !sala || !zoomLink) return;

    const fechaFormateada = new Date(fecha).toLocaleDateString("es-AR");    
    const horario = `${horaInicio} - ${horaFin}`;

    onSave({
      ...turno,
      fecha: fechaFormateada,
      horario,
      sala,
      zoomLink,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#E5E5E5] dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] rounded-md shadow-lg w-96 p-6">
        <h3 className="font-bold text-lg text-[#1E3A8A] dark:text-[#93C5FD] mb-4">
          Editar Turno
        </h3>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-bold dark:text-gray-200">
            Fecha
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="w-full border border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded"
            />
          </label>

          <label className="text-sm font-bold dark:text-gray-200">
            Hora inicio
            <input
              type="time"
              name="horaInicio"
              value={formData.horaInicio}
              onChange={handleChange}
              className="w-full border border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded"
            />
          </label>

          <label className="text-sm font-bold dark:text-gray-200">
            Hora fin
            <input
              type="time"
              name="horaFin"
              value={formData.horaFin}
              onChange={handleChange}
              className="w-full border border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded"
            />
          </label>

          <label className="text-sm font-bold dark:text-gray-200">
            Sala
            <select
              name="sala"
              value={formData.sala}
              onChange={handleChange}
              className="w-full border border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={`Sala ${i + 1}`}>
                  Sala {i + 1}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-bold dark:text-gray-200">
            Link de Zoom
            <input
              type="url"
              name="zoomLink"
              value={formData.zoomLink}
              onChange={handleChange}
              className="w-full border border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-2 py-1 rounded"
            />
          </label>
        </div>

        <div className="flex justify-end gap-3 mt-5">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Guardar cambios
          </Button>
        </div>
      </div>
    </div>
  );
};



