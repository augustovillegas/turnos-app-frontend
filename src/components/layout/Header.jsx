import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header
      className="bg-[#1E3A8A] text-white px-4 sm:px-6 py-3 flex justify-between items-center shadow-md
                 dark:bg-[#0A2E73] dark:text-[#f3f3f3] transition-colors duration-300"
    >
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/")}
        aria-label="Ir al inicio Universidad Nacional de Catamarca"
      >
        <img
          src="/img/unca.png"
          alt="Logo Universidad Nacional de Catamarca"
          className="h-8 w-auto sm:h-9 lg:h-10 drop-shadow-md"
          loading="lazy"
        />
        <h1 className="font-bold text-sm sm:text-base lg:text-xl hover:text-yellow-300 transition-colors duration-200">
          Universidad Nacional de Catamarca
        </h1>
      </div>
    </header>
  );
};
