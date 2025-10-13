import Swal from "sweetalert2";

// Win98 styled modal alerts used across dashboards and forms.

const win98Icon = (name) => `/icons/win98/${name}.png`;

export const win98Alert = ({
  title,
  text,
  icon,
  swalIcon,
  confirmButtonText,
  cancelButtonText,
  showCancelButton,
  ...rest
}) => {
  const dark = document.documentElement.classList.contains("dark");
  return Swal.fire({
    title,
    text,
    icon: swalIcon,
    imageUrl: icon ? win98Icon(icon) : undefined,
    imageWidth: icon ? 32 : undefined,
    background: dark ? "#1E1E1E" : "#FFFFFF",
    color: dark ? "#E5E7EB" : "#111827",
    showCancelButton,
    confirmButtonText: confirmButtonText || "Aceptar",
    cancelButtonText: cancelButtonText || "Cancelar",
    confirmButtonColor: "#017F82",
    cancelButtonColor: "#6B7280",
    customClass: {
      popup: "rounded-md border-2 border-[#111827] dark:border-[#333]",
      confirmButton: "px-4 py-2 bg-[#017F82] text-white rounded-md",
      cancelButton:
        "px-4 py-2 bg-[#E5E5E5] text-black rounded-md border-2 border-[#111827]",
      title: "font-bold text-[#1E3A8A] dark:text-[#93C5FD]",
    },
    ...rest,
  });
};
