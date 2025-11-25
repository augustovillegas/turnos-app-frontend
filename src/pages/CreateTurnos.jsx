// === Create Turnos ===
// Flujo multipaso para crear, editar y ver detalle de turnos.
import { useState } from "react";
import { LayoutWrapper } from "../components/layout/LayoutWrapper";
import { TurnoForm } from "../components/turnos/TurnoForm";
import { TurnoEdit } from "../components/turnos/TurnoEdit";
import { TurnoDetail } from "../components/turnos/TurnoDetail";
import { TurnosList } from "../components/turnos/TurnosList";

export const CreateTurnos = ({ withWrapper = true }) => {
  // --- Estado que determina la vista activa dentro del flujo ---
  const [modo, setModo] = useState("listar");
  const [turnoSeleccionado, setTurnoSeleccionado] = useState(null);

  // --- Regresa al listado principal y limpia la seleccion ---
  const goListar = () => {
    setModo("listar");
    setTurnoSeleccionado(null);
  };

  const containerClass = "text-[#111827] dark:text-gray-100 transition-colors duration-300";
  const Container = withWrapper ? LayoutWrapper : "div";
  const containerProps = withWrapper
    ? { className: containerClass }
    : { className: `w-full flex flex-col gap-6 ${containerClass}` };

  return (
    <Container {...containerProps}>
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
    </Container>
  );
};
