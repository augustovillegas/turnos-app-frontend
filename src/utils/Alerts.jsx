import Swal from "sweetalert2";
const win98Icon = (name) => `/icons/win98/${name}.png`;

export const win98Alert = ({ title, text, icon }) => {
  const dark = document.documentElement.classList.contains("dark");
  return Swal.fire({
    title,
    text,
    imageUrl: icon ? win98Icon(icon) : undefined,
    imageWidth: 32,
    background: dark ? "#1E1E1E" : "#FFFFFF",
    color: dark ? "#E5E7EB" : "#111827",
    confirmButtonColor: "#017F82",
    customClass: {
      popup: "rounded-md border-2 border-[#111827] dark:border-[#333]",
      confirmButton: "px-4 py-2 bg-[#017F82] text-white rounded-md",
      title: "font-bold text-[#1E3A8A] dark:text-[#93C5FD]",
    },
  });
};
