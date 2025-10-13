import { motion as Motion } from "framer-motion";
import { Window } from "../ui/Window";

const FEATURES = [
  {
    id: 1,
    title: "Turnos online",
    description: "Solicitá y gestioná tus turnos fácilmente.",
    icon: "bi-calendar-check",
    image: "/icons/calendar-0.png",
  },
  {
    id: 2,
    title: "Gestión centralizada",
    description: "Un único lugar para entregas y aprobaciones.",
    icon: "bi-diagram-3",
    image: "/icons/directory_control_panel-3.png",
  },
  {
    id: 3,
    title: "Repositorios integrados",
    description: "GitHub + Render conectados en la app.",
    icon: "bi-github",
    image: "/icons/directory_net_web-4.png",
  },
];

export const Features = () => (
  <section className="bg-[#E5E5E5] px-4 py-16 text-center transition-colors duration-300 dark:bg-[#1E1E1E] sm:px-6">
    <h3 className="mb-6 text-3xl font-bold text-[#111827] dark:text-gray-200">
      Herramientas de Gestión Académica
    </h3>
    <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
      {FEATURES.map((feature, index) => (
        <Motion.div
          key={feature.id}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.2, duration: 0.6 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <Window title={feature.title} icon={feature.icon} image={feature.image}>
            <p className="text-sm text-[#111827] dark:text-gray-200">
              {feature.description}
            </p>
          </Window>
        </Motion.div>
      ))}
    </div>
  </section>
);

