import { DashboardAlumno } from "../pages/DashboardAlumno";
import { requireAuth } from "../router/session";

export function loader() {
  return requireAuth(["alumno"]);
}

export function Component() {
  return <DashboardAlumno />;
}
