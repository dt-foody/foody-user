import { Product, ProductPaginate } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const productService = {
  getAll: async (query: {
    [key: string]: any;
  }): Promise<ProductPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/products?${queryString}`;

    return await apiFetch<ProductPaginate>(url);
  },
  getById: async (id: number): Promise<Product> => {
    return await apiFetch(`/products/${id}`);
  },
};
