// Indicador de carga sencillo para mostrar mientras se resuelven rutas o datos diferidos.
export const Loader = ({ label = "Cargando..." }) => (
  <div className="flex h-full w-full flex-col items-center justify-center gap-3 py-12">
    <span className="sr-only">{label}</span>
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-teal-500 border-t-transparent dark:border-teal-300" />
    <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
      {label}
    </p>
  </div>
);
