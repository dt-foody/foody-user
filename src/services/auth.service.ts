import { apiFetch } from "@/utils/api";
// import { TLoginSchema, TRegisterSchema } from "@/validations/auth";

export const authService = {
  login: async (data: any): Promise<any> => {
    return await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  logout: async (): Promise<any> => { // ⚡ Hàm logout đã có ở đây
    return await apiFetch("/auth/logout", {
      method: "POST",
    });
  },
  register: async (data: any): Promise<any> => {
    return await apiFetch("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  getMe: async (): Promise<any> => {
    return await apiFetch("/auth/me");
  },
};

export default authService;