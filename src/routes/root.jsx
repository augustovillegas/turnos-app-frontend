import { isRouteErrorResponse, useRouteError } from "react-router-dom";
import { Layout } from "../shell/Layout";

export function Component() {
  return <Layout />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  let message = "Ocurrió un error inesperado.";
  if (isRouteErrorResponse(error)) {
    message = error.statusText || `Error ${error.status}`;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#017F82] p-8 text-center text-white">
      <h1 className="text-3xl font-bold mb-4">Ups! Algo salió mal.</h1>
      <p className="max-w-xl text-base opacity-80">{message}</p>
    </div>
  );
}
