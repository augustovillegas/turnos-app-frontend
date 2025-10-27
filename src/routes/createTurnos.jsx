/* eslint-disable react-refresh/only-export-components */
import { CreateTurnos } from "../pages/CreateTurnos";
import { requerirAutenticacion } from "../router/session";

export function loader() {
  return requerirAutenticacion(["profesor", "superadmin"]);
}

export function Component() {
  return <CreateTurnos />;
}
