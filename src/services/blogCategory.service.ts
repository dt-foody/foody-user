import { BlogCategory, BlogCategoryPaginate } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const blogCategoryService = {
  getAll: async (query: {
    [key: string]: any;
  }): Promise<BlogCategoryPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/blog-categories?${queryString}`;

    return await apiFetch<BlogCategoryPaginate>(url);
  },
  getById: async (id: number): Promise<BlogCategory> => {
    return await apiFetch(`/blog-categories/${id}`);
  },
};
