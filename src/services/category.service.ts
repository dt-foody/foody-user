import { Category, CategoryPaginate } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const categoryService = {
  getAll: async (query: { [key: string]: any }): Promise<CategoryPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/categories?${queryString}`;

    return await apiFetch<CategoryPaginate>(url);
  },
  getById: async (id: number): Promise<Category> => {
    return await apiFetch(`/categories/${id}`);
  },
};
