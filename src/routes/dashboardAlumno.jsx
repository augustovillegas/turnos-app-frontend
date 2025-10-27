/* eslint-disable react-refresh/only-export-components */
import { DashboardAlumno } from "../pages/DashboardAlumno";
import { requerirAutenticacion } from "../router/session";

export function loader() {
  return requerirAutenticacion(["alumno"]);
}

export function Component() {
  return <DashboardAlumno />;
}
