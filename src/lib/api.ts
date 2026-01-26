// src/lib/api.ts
import { API_URL } from "@/constants";

export interface ApiError {
  message: string;
  statusCode?: number;
}

// Biến trạng thái để quản lý việc refresh token (Pattern: Singleton Promise)
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

/**
 * Hàm wrapper cho backend API calls.
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit & { _retry?: boolean } = {}, // Thêm flag _retry để đánh dấu request đang thử lại
): Promise<T> => {
  const url = `${API_URL}${endpoint}`;

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: "include", // Quan trọng: Gửi kèm cookie
  };

  try {
    const response = await fetch(url, config);

    // ❌ XỬ LÝ KHI BACKEND TRẢ VỀ LỖI
    if (!response.ok) {
      // 🚨 Case 1: Token hết hạn (401)
      if (response.status === 401 && !options._retry) {
        if (!isRefreshing) {
          // Bắt đầu quá trình refresh
          isRefreshing = true;
          refreshPromise = fetch(`${API_URL}/auth/refresh-tokens`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include", // Gửi cookie chứa refresh token lên server
          })
            .then((res) => {
              if (!res.ok) throw new Error("Refresh token failed");
              return res.json();
            })
            .catch((error) => {
              // Nếu refresh thất bại -> Logout hoặc điều hướng về login
              // window.location.href = "/login";
              throw error;
            })
            .finally(() => {
              // Reset trạng thái sau khi xong
              isRefreshing = false;
              refreshPromise = null;
            });
        }

        // Chờ quá trình refresh hoàn tất (cho dù là request đầu tiên hay các request đến sau)
        if (refreshPromise) {
          try {
            await refreshPromise;
            // Refresh thành công -> Gọi lại request ban đầu với flag _retry = true
            return await apiFetch<T>(endpoint, { ...options, _retry: true });
          } catch (refreshError) {
            // Refresh thất bại -> Ném lỗi ra ngoài để component xử lý (thường là logout)
            throw <ApiError>{
              message: "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.",
              statusCode: 401,
            };
          }
        }
      }

      // 🚨 Case 2: Các lỗi khác (400, 403, 500...)
      let errorData: any;
      try {
        errorData = await response.json();
      } catch {
        errorData = { message: response.statusText };
      }

      throw <ApiError>{
        message: errorData.message || "Unknown API error",
        statusCode: response.status,
      };
    }

    // ✅ XỬ LÝ 204: No Content
    if (response.status === 204) {
      return null as T;
    }

    // 🔥 Đọc response body
    const text = await response.text();
    if (!text || text.trim() === "") {
      throw <ApiError>{
        message: "Empty response body",
        statusCode: response.status,
      };
    }

    // 🔥 Parse JSON
    try {
      return JSON.parse(text) as T;
    } catch (jsonErr) {
      throw <ApiError>{
        message: "Invalid JSON response from API",
        statusCode: response.status,
      };
    }
  } catch (err: any) {
    throw <ApiError>{
      message:
        err?.message ||
        "Có sự cố xảy ra, vui lòng liên hệ admin để được hỗ trợ.",
      statusCode: err?.statusCode,
    };
  }
};
