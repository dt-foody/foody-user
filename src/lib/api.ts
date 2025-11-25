// services/apiService.ts
import { API_URL } from "@/constants";

export interface ApiError {
  message: string;
  statusCode?: number;
}

/**
 * A generic fetch wrapper for backend API calls.
 * - Always returns parsed JSON (no null)
 * - Throws unified ApiError on failures
 */
export const apiFetch = async <T>(
  endpoint: string,
  options: RequestInit = {}
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
    credentials: "include",
  };

  try {
    const response = await fetch(url, config);

    // ❌ Backend trả về HTTP lỗi
    if (!response.ok) {
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

    // ❌ 204 = No content => FE không dùng được => throw
    if (response.status === 204) {
      throw <ApiError>{
        message: "Empty response (204 No Content)",
        statusCode: 204,
      };
    }

    // 🔥 Đọc raw text để tránh lỗi JSON parse khi body rỗng
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
    // Đây là lớp catch cuối: luôn trả error thống nhất
    throw <ApiError>{
      message:
        err?.message ||
        "Có sự cố xảy ra, vui lòng liên hệ admin để được hỗ trợ.",
      statusCode: err?.statusCode,
    };
  }
};
