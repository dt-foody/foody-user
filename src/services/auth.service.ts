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
    return null;
  }
};

const forgotPassword = async (data: any /* TRegisterSchema */): Promise<GetMeResponse | null> => {
  return await apiFetch("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(data),
    cache: "no-store",
  });
};



const resetPassword = async (data: any /* TResetPasswordSchema */): Promise<GetMeResponse | null> => {
  // Luôn bỏ cache khi lấy thông tin user
  const bodyData = {
    password: data.password
  }
  return await apiFetch(`/auth/reset-password?token=${data.token}`, {
    method: "POST",
    body: JSON.stringify(bodyData),
    cache: "no-store",
  });
};

const changePassword = async (data: any /* TChangePasswordSchema */): Promise<any> => {
  return await apiFetch("/users/change-password", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

const refreshToken = async (): Promise<any> => {
  // Lưu ý: apiFetch đã có logic tự động refresh khi gặp 401,
  // nên hàm này chủ yếu dùng để chủ động refresh trước khi token hết hạn nếu muốn.
  return await apiFetch("/auth/refresh-token", {
    method: "POST",
  });
};

// Export tất cả hàm dưới dạng một object
export const authService = {
  login,
  logout,
  register,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
};

export default authService;
