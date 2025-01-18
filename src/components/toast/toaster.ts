import { toast, ToastContent, ToastOptions } from "react-toastify";

export const Toaster = {
  success: (content: ToastContent, options?: ToastOptions<object> | undefined) =>
    toast.success(content, options),
  error: (content: ToastContent, options?: ToastOptions<object> | undefined) =>
    toast.error(content, options),
  info: (content: ToastContent, options?: ToastOptions<object> | undefined) =>
    toast.info(content, options),
  warning: (content: ToastContent, options?: ToastOptions<object> | undefined) =>
    toast.warning(content, options),
  warn: (content: ToastContent, options?: ToastOptions<object> | undefined) =>
    toast.warn(content, options),
  dark: (content: ToastContent, options?: ToastOptions<object> | undefined) =>
    toast.dark(content, options),
};
