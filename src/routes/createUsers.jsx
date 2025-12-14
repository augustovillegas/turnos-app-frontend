/* eslint-disable react-refresh/only-export-components */
import { CreateUsers } from "../pages/CreateUsers";
import { requerirAutenticacion } from "../router/session";

export function loader() {
  // Solo pueden entrar profesor y superadmin
  return requerirAutenticacion(["profesor", "superadmin"]);
}

export function Component() {
  return <CreateUsers />;
}
