import { createBrowserRouter, createMemoryRouter } from "react-router-dom";

export const RUTAS_APLICACION = [
  {
    path: "/",
    lazy: () => import("../routes/root"),
    children: [
      {
        index: true,
        lazy: () => import("../routes/landing"),
      },
      {
        path: "login",
        lazy: () => import("../routes/login"),
      },
      {
        path: "dashboard/alumno",
        lazy: () => import("../routes/dashboardAlumno"),
      },
      {
        path: "dashboard/profesor",
        lazy: () => import("../routes/dashboardProfesor"),
      },
      {
        path: "dashboard/superadmin",
        lazy: () => import("../routes/dashboardSuperadmin"),
      },
      {
        path: "items",
        lazy: () => import("../routes/createTurnos"),
      },
    ],
  },
  {
    path: "*",
    lazy: () => import("../routes/not-found"),
  },
];

export const OPCIONES_ROUTER_FUTURO = {
  future: {
    v7_relativeSplatPath: true,
    v7_fetcherPersist: true,
    v7_normalizeFormMethod: true,
    v7_partialHydration: true,
    v7_skipActionErrorRevalidation: true,
  },
};

export const createAppRouter = (opciones = {}) =>
  createBrowserRouter(RUTAS_APLICACION, {
    ...OPCIONES_ROUTER_FUTURO,
    ...opciones,
    future: opciones.future ?? OPCIONES_ROUTER_FUTURO.future,
  });

export const createRouterMemoria = ({
  entradasIniciales = ["/"],
  habilitarFuturos = false,
  opcionesAdicionales = {},
  rutasPersonalizadas,
} = {}) =>
  createMemoryRouter(rutasPersonalizadas ?? RUTAS_APLICACION, {
    initialEntries: entradasIniciales,
    ...opcionesAdicionales,
    future: habilitarFuturos ? OPCIONES_ROUTER_FUTURO.future : undefined,
  });
