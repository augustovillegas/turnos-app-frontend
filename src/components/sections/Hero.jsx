import { motion as Motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/Button";

export const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-[#017F82] py-36 text-center transition-colors duration-300 dark:bg-[#0F3D3F]">
      <Motion.h1
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true, amount: 0.5 }}
        className="mb-6 text-4xl font-bold text-[#1E3A8A] dark:text-[#93C5FD] md:text-6xl"
      >
        Portal de Gestión Académica
      </Motion.h1>
      <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-100 transition-colors duration-300 dark:text-gray-300">
        De planillas Excel a una plataforma académica moderna y retro-estilizada.
      </p>

      <Button variant="primary" onClick={() => navigate("/login")}>
        Ingresar a la App
      </Button>
    </section>
  );
};

