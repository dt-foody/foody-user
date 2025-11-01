import { PricePromotion, PricePromotionPaginate } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const pricePromotionService = {
  getAll: async (query: { [key: string]: any }): Promise<PricePromotionPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/price-promotions?${queryString}`;

    return await apiFetch<PricePromotionPaginate>(url);
  },
  getById: async (id: number): Promise<PricePromotion> => {
    return await apiFetch(`/price-promotions/${id}`);
  },
};
