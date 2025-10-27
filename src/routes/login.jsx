/* eslint-disable react-refresh/only-export-components */
import { Login } from "../pages/Login";
import { redirigirSiAutenticado } from "../router/session";

export function loader() {
  return redirigirSiAutenticado();
}

export function Component() {
  return <Login />;
}
