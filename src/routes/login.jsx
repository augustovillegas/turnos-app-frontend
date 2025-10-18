import { Login } from "../pages/Login";
import { redirectIfAuthenticated } from "../router/session";

export function loader() {
  return redirectIfAuthenticated();
}

export function Component() {
  return <Login />;
}
