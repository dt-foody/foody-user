import { apiFetch } from "@/utils/api";

export const authService = {
  auth: async (): Promise<any> => {
    return await apiFetch("/auth/login");
  },
};
