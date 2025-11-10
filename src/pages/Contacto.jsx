import { useState } from "react";
import { Button } from "../components/ui/Button";
import { showToast } from "../utils/feedback/toasts";

export default function Contacto() {
  const [enviando, setEnviando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (enviando) return;
    setEnviando(true);

    const data = Object.fromEntries(new FormData(e.currentTarget));
    console.log("Contacto :: payload", data);

    // Simulación de envío
    await new Promise((r) => setTimeout(r, 800));
    showToast("¡Mensaje enviado! (provisorio)", "success");
    e.currentTarget.reset();
    setEnviando(false);
  }

  return (
    <main
      role="main"
      aria-label="Página de contacto"
      className="
        min-h-[calc(100vh-2.5rem)]
        flex items-start justify-center
        px-4 pt-6 pb-16
        bg-[#017F82] dark:bg-[#0F3D3F]
        transition-colors duration-300
      "
    >
      <div className="w-full max-w-4xl">
        {/* Barra superior (coincide con Login) */}
        <div className="bg-[#1E3A8A] dark:bg-[#0A2E73] text-white px-4 py-2 rounded-t-md shadow">
          <div className="flex items-center gap-2">
            <img src="public/icons/mail-2.png" alt="" className="w-5 h-5" />
            <h1 className="font-bold text-sm">Contacto</h1>
          </div>
        </div>

        {/* Contenedor principal estilo tarjeta */}
        <section
          className="
            bg-[#E5E5E5] dark:bg-[#1E1E1E]
            border-2 border-[#111827] dark:border-[#333]
            rounded-b-md shadow-lg
          "
        >
          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="nombre"
                  className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1"
                >
                  Nombre
                </label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  required
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300"
                />
              </div>

              <div>
                <label
                  htmlFor="asunto"
                  className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1"
                >
                  Asunto
                </label>
                <input
                  id="asunto"
                  name="asunto"
                  type="text"
                  required
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300"
                />
              </div>

              <div>
                <label
                  htmlFor="mensaje"
                  className="block text-sm font-bold text-[#111827] dark:text-gray-200 mb-1"
                >
                  Mensaje
                </label>
                <textarea
                  id="mensaje"
                  name="mensaje"
                  rows={6}
                  required
                  className="w-full border-2 border-[#111827] dark:border-[#444] dark:bg-[#2A2A2A] dark:text-gray-200 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-[#FFD700] dark:focus:ring-[#B8860B] transition-colors duration-300 resize-y"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="primary"
                  type="submit"
                  disabled={enviando}
                  className="flex-1"
                >
                  {enviando ? "Enviando..." : "Enviar"}
                </Button>
                <Button
                  variant="secondary"
                  type="reset"
                  className="flex-1"
                  disabled={enviando}
                >
                  Limpiar
                </Button>
              </div>

              <p className="text-xs text-[#111827]/70 dark:text-gray-400">
                * Formulario provisorio. Integraremos envío real (API/Email) más
                adelante.
              </p>
            </form>

            {/* Panel lateral: datos y “tarjetitas” */}
            <aside className="space-y-4">
              {/* Tarjeta de datos */}
              <div
                className="
  p-4 rounded
  border-2 border-[#111827]
  bg-white
  text-[#111827]
  dark:border-[#475569]          /* slate-500: más visible que #333 */
  dark:bg-[#0f172a]              /* slate-900: fondo dark real */
  dark:text-slate-100            /* texto bien claro */
"
              >
                <p className="font-semibold text-sm text-[#111827] dark:text-white">
                  Datos de contacto
                </p>

                <ul className="mt-2 text-sm leading-6">
                  <li className="dark:text-slate-200">
                    <span className="font-medium">Email:</span>{" "}
                    <a
                      className="
          underline underline-offset-2
          text-blue-700 hover:text-blue-800
          dark:text-sky-300 dark:hover:text-sky-200
          decoration-sky-500/50 dark:decoration-sky-300/50
          transition-colors
        "
                      href="mailto:hola@perfilhibrido.com"
                    >
                      hola@perfilhibrido.com
                    </a>
                  </li>

                  <li className="dark:text-slate-200">
                    <span className="font-medium">LinkedIn:</span>{" "}
                    <a
                      className="
          underline underline-offset-2
          text-blue-700 hover:text-blue-800
          dark:text-sky-300 dark:hover:text-sky-200
          decoration-sky-500/50 dark:decoration-sky-300/50
          transition-colors
        "
                      href="https://www.linkedin.com/company/perfil-hibrido"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Perfil Híbrido
                    </a>
                  </li>

                  <li className="dark:text-slate-200">
                    <span className="font-medium">WhatsApp:</span>{" "}
                    <a
                      className="
          underline underline-offset-2
          text-blue-700 hover:text-blue-800
          dark:text-sky-300 dark:hover:text-sky-200
          decoration-sky-500/50 dark:decoration-sky-300/50
          transition-colors
        "
                      href="https://wa.me/5491112345678"
                      target="_blank"
                      rel="noreferrer"
                    >
                      +54 9 11 1234-5678
                    </a>
                  </li>
                </ul>
              </div>

              {/* Tarjeta con “horarios y respuesta” */}
              <div className="p-4 rounded border-2 border-[#111827] dark:border-[#333] bg-[#F8FAFC] dark:bg-[#1E1E1E]">
                <p className="font-semibold text-sm text-[#111827] dark:text-gray-100">
                  Tiempos de respuesta
                </p>
                <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">
                  Respondemos normalmente en 24–48 h hábiles. Si es urgente,
                  escribinos por WhatsApp.
                </p>
              </div>

              {/* Tarjeta mini con CTA secundario */}
              <div className="p-4 rounded border-2 border-[#111827] dark:border-[#333] bg-[#E5E5E5] dark:bg-[#2A2A2A]">
                <p className="text-sm font-semibold text-[#111827] dark:text-gray-100">
                  ¿Preferís una llamada?
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                  Coordinemos un encuentro rápido por videollamada.
                </p>
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    onClick={() =>
                      showToast("Pronto agregaremos el agendado.", "info")
                    }
                  >
                    Agendar
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
