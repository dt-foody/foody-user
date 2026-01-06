import {
  ProductPaginate,
} from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const userService = {
  getAll: async (query: { [key: string]: any }): Promise<ProductPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/users?${queryString}`;

    return await apiFetch<ProductPaginate>(url);
  },
};
