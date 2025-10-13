// === MSW Server ===
// Configura el servidor de mocks para interceptar peticiones HTTP en las pruebas.

import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);

export { resetMockState } from "./handlers";
