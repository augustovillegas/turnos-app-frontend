import { DashboardSuperadmin } from "../pages/DashboardSuperadmin";
import { requireAuth } from "../router/session";

export function loader() {
  return requireAuth(["superadmin"]);
}

export function Component() {
  return <DashboardSuperadmin />;
}
