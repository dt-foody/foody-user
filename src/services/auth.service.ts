import api from "@/utils/api";

export const authService = {
  auth: async (): Promise<any> => {
    const response = await api.get("/auth/login");
    return response.data;
  },
};
