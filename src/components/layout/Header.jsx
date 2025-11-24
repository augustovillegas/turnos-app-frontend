import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  return (
    <header
      className="bg-[#1E3A8A] text-white px-4 sm:px-6 py-3 flex justify-between items-center shadow-md
                 dark:bg-[#0A2E73] dark:text-[#f3f3f3] transition-colors duration-300"
    >
      <h1
        onClick={() => navigate("/")}
        className="font-bold text-sm sm:text-base lg:text-xl cursor-pointer hover:text-yellow-300 transition-colors duration-200"
      >
        Universidad Nacional de Catamarca
      </h1>
    </header>
  );
};
