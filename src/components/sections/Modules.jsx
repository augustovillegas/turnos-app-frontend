import { motion } from "framer-motion";
import { Window } from "../ui/Window";

const modules = [
  {
    id: 1,
    title: "Módulo 1 - HTML & CSS",
    description:
      "Fundamentos del desarrollo web: estructura de páginas con HTML5 y estilos con CSS3. Se abordan conceptos de maquetado y diseño responsive.",
    icon: "bi-file-earmark-code",
    image: "/icons/html.svg",
  },
  {
    id: 2,
    title: "Módulo 2 - JavaScript",
    description:
      "Introducción a la programación con JavaScript. Lógica, variables, funciones y manipulación del DOM para crear sitios dinámicos.",
    icon: "bi-braces",
    image: "/icons/javascript.svg",
  },
  {
    id: 3,
    title: "Módulo 3 - Node.js",
    description:
      "Construcción del backend con Node.js. Manejo de APIs, rutas y servicios utilizando Express, con foco en la arquitectura cliente-servidor.",
    icon: "bi-server",
    image: "/icons/nodejs.svg",
  },
  {
    id: 4,
    title: "Módulo 4 - React.js",
    description:
      "Creación de interfaces modernas con React. Componentes, hooks, estado y props para construir aplicaciones interactivas.",
    icon: "bi-lightning",
    image: "/icons/react.svg",
  },
];

export const Modules = () => {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#017F82] dark:bg-[#0F3D3F] text-center transition-colors duration-300">
      {/* Fondo distinto (retro gris azulado) */}
      <h3 className="text-3xl font-bold mb-10 text-[#1E3A8A] dark:text-[#93C5FD] transition-colors duration-300">
        Módulos de Diplomatura en Desarrollo Web
      </h3>
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {modules.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <Window title={m.title} icon={m.icon} image={m.image}>
              <p className="text-[#111827] dark:text-gray-200 text-base leading-relaxed transition-colors duration-300">
                {m.description}
              </p>
            </Window>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

