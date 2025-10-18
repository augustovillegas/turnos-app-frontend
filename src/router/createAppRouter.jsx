import { createBrowserRouter } from "react-router-dom";

export const createAppRouter = () =>
  createBrowserRouter(
    [
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
    ],
    {
      future: {
        v7_relativeSplatPath: true,
        v7_fetcherPersist: true,
        v7_normalizeFormMethod: true,
        v7_partialHydration: true,
        v7_skipActionErrorRevalidation: true,
      },
    }
  );
