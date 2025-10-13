import { motion as Motion } from "framer-motion";
import { Window } from "../ui/Window";

const MODULES = [
  {
    id: 1,
    title: "Módulo 1 - HTML & CSS",
    description:
      "Fundamentos del desarrollo web: estructura de páginas con HTML5 y estilos con CSS3. Conceptos de maquetado y diseño responsive.",
    icon: "bi-file-earmark-code",
    image: "/icons/html.svg",
  },
  {
    id: 2,
    title: "Módulo 2 - JavaScript",
    description:
      "Introducción a la programación con JavaScript. Lógica, variables, funciones y manipulación del DOM para sitios dinámicos.",
    icon: "bi-braces",
    image: "/icons/javascript.svg",
  },
  {
    id: 3,
    title: "Módulo 3 - Node.js",
    description:
      "Construcción del backend con Node.js. Manejo de APIs, rutas y servicios utilizando Express con foco en la arquitectura cliente-servidor.",
    icon: "bi-server",
    image: "/icons/nodejs.svg",
  },
  {
    id: 4,
    title: "Módulo 4 - React.js",
    description:
      "Creación de interfaces modernas con React. Componentes, hooks, estado y props para aplicaciones interactivas.",
    icon: "bi-lightning",
    image: "/icons/react.svg",
  },
];

export const Modules = () => (
  <section className="bg-[#017F82] px-4 py-20 text-center transition-colors duration-300 dark:bg-[#0F3D3F] sm:px-6">
    <h3 className="mb-10 text-3xl font-bold text-[#1E3A8A] transition-colors duration-300 dark:text-[#93C5FD]">
      Módulos de la Diplomatura en Desarrollo Web
    </h3>
    <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
      {MODULES.map((module, index) => (
        <Motion.div
          key={module.id}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2, duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Window title={module.title} icon={module.icon} image={module.image}>
            <p className="text-base leading-relaxed text-[#111827] transition-colors duration-300 dark:text-gray-200">
              {module.description}
            </p>
          </Window>
        </Motion.div>
      ))}
    </div>
  </section>
);

