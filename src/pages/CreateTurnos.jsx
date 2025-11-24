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
    <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 text-[#111827] dark:text-gray-100 transition-colors duration-300">
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

        {modo === "crear" && <TurnoForm onVolver={goListar} />}

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
