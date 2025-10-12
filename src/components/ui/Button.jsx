export const Button = ({
  children,
  variant = "primary",
  type = "button",
  onClick,
  className = "",
}) => {
  const base =
    "px-3 py-1 rounded-md font-bold border-2 shadow-md transition-colors duration-300";
  const styles = {
    primary:
      "bg-[#FFD700] text-black border-[#111827] hover:opacity-90 dark:bg-[#C9A300] dark:text-white dark:border-[#555]",
    danger:
      "bg-[#DC2626] text-white border-[#111827] hover:opacity-90 dark:bg-[#991B1B] dark:border-[#555]",
    success:
      "bg-[#16A34A] text-white border-[#111827] hover:opacity-90 dark:bg-[#15803D] dark:border-[#555]",
    secondary:
      "bg-[#E5E5E5] text-black border-[#111827] hover:opacity-90 dark:bg-[#2A2A2A] dark:text-gray-200 dark:border-[#444]",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${base} ${styles[variant]} ${className}`}
    >
      {children}
    </button>
  );
};
