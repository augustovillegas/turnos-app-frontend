// === Create Turnos ===
// Flujo multipaso para crear, editar y ver detalle de turnos.
import { useState } from "react";
import { TurnoForm } from "../components/turnos/TurnoForm";
import { TurnoEdit } from "../components/turnos/TurnoEdit";
import { TurnoDetail } from "../components/turnos/TurnoDetail";
import { TurnosList } from "../components/turnos/TurnosList";

export const CreateTurnos = () => {
  // --- Estado que determina la vista activa dentro del flujo ---
  const [modo, setModo] = useState("listar");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  // --- Regresa al listado principal y limpia la seleccion ---
  const goListar = () => {
    setModo("listar");
    setTurnoSeleccionado(null);
  };

  return (
    <div className="min-h-screen bg-[#017F82] transition-colors duration-300 dark:bg-[#0F3D3F]">
      {modo === "listar" && (
        <TurnosList
          onCrear={() => {
            setModo("crear");
            setTurnoSeleccionado(null);
          }}
          onEditar={(turno) => {
            setTurnoSeleccionado(turno ?? null);
            setModo("editar");
          }}
          onVer={(turno) => {
            setTurnoSeleccionado(turno ?? null);
            setModo("detalle");
          }}
        />
      )}

      {modo === "crear" && (
        <TurnoForm
          onVolver={goListar}
        />
      )}

      {modo === "editar" && (
        <TurnoEdit
          turno={turnoSeleccionado}
          turnoId={turnoSeleccionado?.id}
          onVolver={goListar}
        />
      )}

      {modo === "detalle" && (
        <TurnoDetail
          turno={turnoSeleccionado}
          turnoId={turnoSeleccionado?.id}
          onVolver={goListar}
        />
      )}
    </div>
  );
};
