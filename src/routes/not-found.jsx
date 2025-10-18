import { Link } from "react-router-dom";

export function Component() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#017F82] p-8 text-center text-white">
      <h1 className="text-3xl font-bold mb-4">Página no encontrada</h1>
      <p className="mb-6 opacity-80">
        No pudimos encontrar la ruta que estás buscando.
      </p>
      <Link
        to="/"
        className="rounded-md border-2 border-white px-4 py-2 font-semibold hover:bg-white hover:text-[#017F82] transition-colors duration-200"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
