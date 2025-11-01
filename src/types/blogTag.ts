// src/types/blogTag.ts
import type { Paginated } from "@/lib";

export interface BlogTag {
  id: string;
  name: string;
  slug: string;

  // Style
  backgroundColor: string; // ví dụ "#E0E0E0"
  textColor: string;       // ví dụ "#212121"

  // Nội dung/hiển thị
  description?: string;

  // Thống kê & trạng thái
  postCount: number;
  isActive: boolean;

  // Audit (read-only phía user)
  createdBy?: string | { id: string; name?: string; email?: string } | null;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export type BlogTagPaginate = Paginated<BlogTag>;
