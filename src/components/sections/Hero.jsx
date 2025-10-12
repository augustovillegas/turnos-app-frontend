import { motion } from "framer-motion";
import { Button } from "../ui/Button";

export const Hero = () => {
  return (
    <section className="text-center py-36 bg-[#017F82] dark:bg-[#0F3D3F] transition-colors duration-300">
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.5 }}
        className="text-4xl md:text-6xl font-bold mb-6 text-[#1E3A8A] dark:text-[#93C5FD]"
      >
        Portal de Gestión Académica
      </motion.h1>
      <p className="text-lg text-gray-100 dark:text-gray-300 mb-6 max-w-2xl mx-auto transition-colors duration-300">
        De planillas Excel a una plataforma académica moderna y
        retro-estilizada.
      </p>

      <Button variant="primary">Ingresar a la App</Button>
    </section>
  );
};

