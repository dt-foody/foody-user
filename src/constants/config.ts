// src/config/env.ts
/** Centralize ENV-based config for both client & server (Next.js App Router) */

const trimRightSlash = (s: string) => s.replace(/\/+$/, "");

/** ---------- PUBLIC (an toàn cho client) ---------- */
const PUBLIC_API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";
const PUBLIC_API_VERSION = process.env.NEXT_PUBLIC_API_VERSION ?? "v1";
const PUBLIC_APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001";

/** Public exports: dùng được ở mọi nơi (CSR/SSR) */
export const ENV_PUBLIC = {
  apiBase: trimRightSlash(PUBLIC_API_BASE), // ví dụ: http://localhost:3001
  apiVersion: PUBLIC_API_VERSION, // ví dụ: v1
  appUrl: trimRightSlash(PUBLIC_APP_URL), // ví dụ: http://localhost:3000
} as const;

/** URL đầy đủ tới API v1 (thường dùng nhất) */
export const API_URL = `${ENV_PUBLIC.apiBase}/${ENV_PUBLIC.apiVersion}`;
export const PREFIX_IMAGE = `${ENV_PUBLIC.apiBase}`;

/** ---------- SERVER-ONLY (không lộ ra client) ---------- */
const isServer = typeof window === "undefined";

/**
 * Dùng trong Route Handlers / Server Actions:
 * - API_URL_INTERNAL: origin nội bộ (docker network, v.v.). Không có NEXT_PUBLIC_.
 */
export const ENV_SERVER = isServer
  ? ({
      apiInternalUrl: trimRightSlash(process.env.API_URL ?? ENV_PUBLIC.apiBase),
    } as const)
  : (undefined as unknown as {
      apiInternalUrl: string;
    });
