import { toast } from "sonner";

export const notifications = {
  success: (message: string, id?: string) =>
    toast.success(message, { id, duration: 5000 }),
  error: (message: string, id?: string) =>
    toast.error(message, { id, duration: 8000 }),
  dismiss: (id: string) => toast.dismiss(id),
};
