import { BlogTag, BlogTagPaginate } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const blogTagService = {
  getAll: async (query: { [key: string]: any }): Promise<BlogTagPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/blog-tags?${queryString}`;

    return await apiFetch<BlogTagPaginate>(url);
  },
  getById: async (id: number): Promise<BlogTag> => {
    return await apiFetch(`/blog-tags/${id}`);
  },
};
