import { motion } from "framer-motion";
import { Window } from "../ui/Window";

const technologies = [
  {
    id: 1,
    name: "React",
    description:
      "Librería declarativa y eficiente para crear interfaces interactivas. En la diplomatura se usa para construir el frontend con componentes reutilizables y un estilo retro-moderno.",
    icon: "bi-lightning",
  },
  {
    id: 2,
    name: "Node.js",
    description:
      "Entorno de ejecución de JavaScript en el servidor. Permite manejar la lógica de negocio y procesar peticiones en tiempo real. Es la base del backend de la app.",
    icon: "bi-server",
  },
  {
    id: 3,
    name: "Express",
    description:
      "Framework minimalista para Node.js. Facilita la creación de APIs REST y rutas para la comunicación entre frontend y backend.",
    icon: "bi-diagram-3",
  },
  {
    id: 4,
    name: "MongoDB",
    description:
      "Base de datos NoSQL que almacena datos en documentos JSON flexibles. Usada en la diplomatura para manejar usuarios, turnos y entregas.",
    icon: "bi-database",
  },
  {
    id: 5,
    name: "Tailwind CSS",
    description:
      "Framework de utilidades CSS. Permite aplicar estilos de manera rápida y consistente, ideal para mantener la estética retro-estilizada.",
    icon: "bi-palette",
  },
  {
    id: 6,
    name: "GitHub",
    description:
      "Plataforma para alojar código y colaborar en equipo. En la diplomatura se utiliza para entregar trabajos prácticos y proyectos finales.",
    icon: "bi-github",
  },
];

export const Technologies = () => {
  return (
    <section className="py-20 px-4 sm:px-6 bg-[#D1D5DB] dark:bg-[#1E1E1E] text-center transition-colors duration-300">
      {/* gris diferente al de Features */}
      <h3 className="text-3xl font-bold mb-10 text-[#111827] dark:text-gray-200 transition-colors duration-300">
        Tecnologías más populares aplicadas
      </h3>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {technologies.map((tech, i) => (
          <motion.div
            key={tech.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            viewport={{ once: true, amount: 0.2 }}
          >
            <Window title={tech.name} icon={tech.icon}>
              <p className="text-[#111827] dark:text-gray-200 text-base leading-relaxed transition-colors duration-300">
                {tech.description}
              </p>
            </Window>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
