import { toast, ToastContent, ToastOptions } from "react-toastify";

export const Toaster = {
  success: (content: ToastContent, options?: ToastOptions<{}> | undefined) =>
    toast.success(content, options),
  error: (content: ToastContent, options?: ToastOptions<{}> | undefined) =>
    toast.error(content, options),
  info: (content: ToastContent, options?: ToastOptions<{}> | undefined) =>
    toast.info(content, options),
  warning: (content: ToastContent, options?: ToastOptions<{}> | undefined) =>
    toast.warning(content, options),
  warn: (content: ToastContent, options?: ToastOptions<{}> | undefined) =>
    toast.warn(content, options),
  dark: (content: ToastContent, options?: ToastOptions<{}> | undefined) =>
    toast.dark(content, options),
};
