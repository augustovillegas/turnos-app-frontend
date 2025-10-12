import { toast } from "react-toastify";
export const showToast = (msg, type = "success") =>
  toast(msg, { type, theme: "colored", autoClose: 2000 });
