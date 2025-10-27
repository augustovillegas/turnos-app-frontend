/* eslint-disable react-refresh/only-export-components */
import { DashboardSuperadmin } from "../pages/DashboardSuperadmin";
import { requerirAutenticacion } from "../router/session";

export function loader() {
  return requerirAutenticacion(["superadmin"]);
}

export function Component() {
  return <DashboardSuperadmin />;
}
