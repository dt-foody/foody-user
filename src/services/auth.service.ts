// src/services/auth.service.ts

import { apiFetch } from "@/lib/api";
import { GetMeResponse } from "@/types";
/**
 * Đăng nhập
 */
const login = async (data: any /* TLoginSchema */): Promise<any> => {
  return await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Đăng xuất
 */
const logout = async (): Promise<any> => {
  return await apiFetch("/auth/logout", {
    method: "POST",
  });
};

/**
 * Đăng ký
 */
const register = async (data: any /* TRegisterSchema */): Promise<any> => {
  return await apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
};

/**
 * Lấy thông tin người dùng hiện tại
 */
const getMe = async (): Promise<GetMeResponse | null> => {
  try {
    // Luôn bỏ cache khi lấy thông tin user
    return await apiFetch("/auth/me", {
      cache: "no-store",
    });
  } catch (err) {
    console.error("getMe() service error:", err);
    return null;
  }
};

// Export tất cả hàm dưới dạng một object
export const authService = {
  login,
  logout,
  register,
  getMe,
};

export default authService;
