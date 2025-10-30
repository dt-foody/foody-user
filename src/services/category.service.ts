// src/services/categoryService.ts

import { Category, CategoryResponse } from "@/types/category";
import { apiFetch } from "@/utils/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const categoryService = {
  /**
   * Fetch danh sách sản phẩm từ backend.
   * @returns {Promise<Category[]>} - Promise trả về danh sách sản phẩm
   */
  getCategories: async (query: {
    [key: string]: any;
  }): Promise<CategoryResponse> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/categories?${queryString}`;

    return await apiFetch<CategoryResponse>(url);
  },

  /**
   * Fetch thông tin một sản phẩm theo ID.
   * @param id ID của sản phẩm cần lấy thông tin
   * @returns {Promise<Category>} - Promise trả về thông tin sản phẩm
   */
  getCategoryById: async (id: number): Promise<Category> => {
    return await apiFetch(`/categories/${id}`);
  },
};
