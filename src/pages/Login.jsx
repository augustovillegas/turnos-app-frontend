import { Button } from "../components/ui/Button";

export const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <div className="bg-[#E5E5E5] dark:bg-[#1E1E1E] border-2 border-[#111827] dark:border-[#333] rounded-md shadow-lg max-w-md mx-4 overflow-hidden transition-colors duration-300">
        <div className="bg-[#1E3A8A] dark:bg-[#0A2E73] text-white flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm">Iniciar Sesión</span>
          </div>
        </div>

        <div className="flex p-6">
          <div className="flex items-start justify-center pr-6">
            <img
              src="/icons/users_key-4.png"
              alt="User Keys"
              className="w-16 h-16"
            />
          </div>

          <div className="flex-1">
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1">
                  Usuario:
                </label>
                <input
                  type="text"
                  placeholder="Escribe tu usuario"
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1">
                  Contraseña:
                </label>
                <input
                  type="password"
                  placeholder="Escribe tu contraseña"
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300"
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button variant="primary" type="submit" className="flex-1">
                  Aceptar
                </Button>
                <Button variant="secondary" type="button" className="flex-1">
                  Cancelar
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};


