/* eslint-disable react-refresh/only-export-components */
import { DashboardProfesor } from "../pages/DashboardProfesor";
import { requireAuth } from "../router/session";

export function loader() {
  return requireAuth(["profesor", "superadmin"]);
}

export function Component() {
  return <DashboardProfesor />;
}
