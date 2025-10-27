/* eslint-disable react-refresh/only-export-components */
import { DashboardProfesor } from "../pages/DashboardProfesor";
import { requerirAutenticacion } from "../router/session";

export function loader() {
  return requerirAutenticacion(["profesor", "superadmin"]);
}

export function Component() {
  return <DashboardProfesor />;
}
