import { motion as Motion } from "framer-motion";
import { Window } from "../ui/Window";

const TECHNOLOGIES = [
  {
    id: 1,
    name: "React",
    description:
      "Librería declarativa y eficiente para crear interfaces interactivas con componentes reutilizables.",
    icon: "bi-lightning",
  },
  {
    id: 2,
    name: "Node.js",
    description:
      "Entorno de ejecución de JavaScript en el servidor, ideal para manejar la lógica de negocio y APIs.",
    icon: "bi-server",
  },
  {
    id: 3,
    name: "Express",
    description:
      "Framework minimalista para Node.js que simplifica la creación de APIs REST y rutas.",
    icon: "bi-diagram-3",
  },
  {
    id: 4,
    name: "MongoDB",
    description:
      "Base de datos NoSQL que almacena información en documentos flexibles tipo JSON.",
    icon: "bi-database",
  },
  {
    id: 5,
    name: "Tailwind CSS",
    description:
      "Framework de utilidades CSS para aplicar estilos de forma rápida, manteniendo la estética retro.",
    icon: "bi-palette",
  },
  {
    id: 6,
    name: "GitHub",
    description:
      "Plataforma colaborativa para alojar código y coordinar entregas a lo largo del sprint.",
    icon: "bi-github",
  },
];

export const Technologies = () => (
  <section className="bg-[#D1D5DB] px-4 py-20 text-center transition-colors duration-300 dark:bg-[#1E1E1E] sm:px-6">
    <h3 className="mb-10 text-3xl font-bold text-[#111827] transition-colors duration-300 dark:text-gray-200">
      Tecnologías destacadas del sprint
    </h3>
    <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2 lg:grid-cols-3">
      {TECHNOLOGIES.map((tech, index) => (
        <Motion.div
          key={tech.id}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2, duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <Window title={tech.name} icon={tech.icon}>
            <p className="text-base leading-relaxed text-[#111827] transition-colors duration-300 dark:text-gray-200">
              {tech.description}
            </p>
          </Window>
        </Motion.div>
      ))}
    </div>
  </section>
);

