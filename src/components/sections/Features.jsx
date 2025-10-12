import { motion } from "framer-motion";
import { Window } from "../ui/Window";

const features = [
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

export const Features = () => {
  return (
    <section className="py-16 px-4 sm:px-6 bg-[#E5E5E5] dark:bg-[#1E1E1E] text-center transition-colors duration-300">
      <h3 className="text-3xl font-bold mb-6 text-[#111827] dark:text-gray-200">
        Herramientas de Gestión Académica
      </h3>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2, duration: 0.6 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <Window title={f.title} icon={f.icon} image={f.image}>
              <p className="text-[#111827] dark:text-gray-200 text-sm">
                {f.description}
              </p>
            </Window>
          </motion.div>
        ))}
      </div>
    </section>
  );
};


























{/*
  
  
  import { motion } from "framer-motion";
import { Card } from "../ui/Card";

const features = [
  {
    id: 1,
    title: "Turnos online",
    description: "Solicitá y gestioná tus turnos fácilmente.",
  },
  {
    id: 2,
    title: "Gestión centralizada",
    description: "Un único lugar para entregas y aprobaciones.",
  },
  {
    id: 3,
    title: "Repositorios integrados",
    description: "GitHub + Render conectados en la app.",
  },
];

export const Features = () => {
  return (
    <section className="py-16 bg-gray-50 text-center">
      <h3 className="text-2xl font-bold mb-6 text-[#111827]">Características</h3>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
          >
            <Card title={f.title} description={f.description} />
          </motion.div>
        ))}
      </div>
    </section>
  );
};
  
  
  
  
  */}