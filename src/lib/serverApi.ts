import { cookies } from "next/headers";
import { API_URL } from "@/constants";

type Json = any;

export async function serverApiFetch<T = Json>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;

  // Lấy toàn bộ cookie của request hiện tại
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(options.headers as HeadersInit),
    // ✅ QUAN TRỌNG: forward cookie sang backend
    Cookie: cookieHeader,
  };

  const res = await fetch(url, {
    ...options,
    headers,
    cache: "no-store", // user-specific → không cache
    // credentials server-side không có tác dụng
  });

  // Đọc body an toàn (có thể là text rỗng)
  const raw = await res.text();
  const data = raw
    ? (() => {
        try {
          return JSON.parse(raw);
        } catch {
          return raw;
        }
      })()
    : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) || res.statusText || "API error";
    const err: any = new Error(message);
    err.statusCode = res.status;
    err.payload = data;
    throw err;
  }

  return data as T;
}
