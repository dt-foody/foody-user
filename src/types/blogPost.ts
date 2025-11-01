// src/types/blogPost.ts
import type { Paginated } from "@/lib";
import type { BlogTag } from "./blogTag";
import type { BlogCategory } from "./blogCategory";

export type BlogPostStatus = "draft" | "published" | "archived";

export interface BlogPost {
  id: string; // map từ _id
  title: string;
  slug: string;

  summary?: string;
  content: string; // HTML hoặc Markdown (string)

  coverImage?: string;
  coverImageAlt?: string;

  // Quan hệ (có thể backend trả ObjectId string hoặc document populate)
  categories: Array<BlogCategory>;
  tags: Array<BlogTag>;

  status: BlogPostStatus;
  publishedAt?: string;

  isFeatured: boolean;
  isPinned: boolean;

  // SEO
  seoTitle?: string;
  seoDescription?: string;

  // Thống kê
  views: number;

  // Audit (read-only phía user)
  createdBy?: any;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
}

// Paginated response cho list
export type BlogPostPaginate = Paginated<BlogPost>;
