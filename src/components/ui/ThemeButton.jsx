import { useTheme } from "../../context/ThemeContext";

export const ThemeButton = () => {
  const { theme, toggleTheme } = useTheme();
  const darkMode = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`
        w-full text-xs font-bold select-none
        flex items-center justify-center gap-2 px-3 py-1
        bg-[#E5E5E5] text-[#111827]
        border-2 border-t-white border-l-white border-b-[#808080] border-r-[#808080]
        active:border-t-[#808080] active:border-l-[#808080]
        active:border-b-white active:border-r-white
        hover:bg-[#dcdcdc]
        dark:bg-[#2b2b2b] dark:text-[#f3f3f3]
        dark:border-t-[#555] dark:border-l-[#555]
        dark:border-b-[#222] dark:border-r-[#222]
        dark:hover:bg-[#3a3a3a]
        transition-all duration-300 ease-in-out
      `}
    >
      {darkMode ? "☀️ Modo claro" : "🌙 Modo oscuro"}
    </button>
  );
};





