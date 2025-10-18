import { CreateTurnos } from "../pages/CreateTurnos";
import { requireAuth } from "../router/session";

export function loader() {
  return requireAuth(["profesor", "superadmin"]);
}

export function Component() {
  return <CreateTurnos />;
}
