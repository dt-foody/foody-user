// src/types/category.ts
import type { Paginated } from "@/lib";

/** Chỉ đọc: luôn chuẩn hoá về id & parentId (không giữ object populate) */
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;

  isActive: boolean;
  priority: number;

  /** id của parent hoặc null */
  parent: string | Category | null;

  /** danh sách ancestor dưới dạng id */
  ancestors: string[];

  // optional: giữ cho mục đích hiển thị/log
  createdAt?: string;
  updatedAt?: string;
}

/** Response phân trang giữ nguyên shape bạn đang dùng */
export type CategoryPaginate = Paginated<Category>;
