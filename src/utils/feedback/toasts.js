import { toast } from "react-toastify";

// Quick toast notifications with consistent styling and timing.

export const showToast = (message, type = "success") =>
  toast(message, { type, theme: "colored", autoClose: 2000 });
