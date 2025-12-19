import {
  ProductPaginate,
  ReferralPaginate,
} from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const userService = {
  getAll: async (query: { [key: string]: any }): Promise<ProductPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/users?${queryString}`;

    return await apiFetch<ProductPaginate>(url);
  },

  getReferralUsers: async (query: {
    [key: string]: any;
  }): Promise<ReferralPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/users/referral?${queryString}`;
    return await apiFetch<ReferralPaginate>(url);
  },
};
