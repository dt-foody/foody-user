import { Combo, ComboPaginate } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const comboService = {
  getAll: async (query: { [key: string]: any }): Promise<ComboPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/combos?${queryString}`;

    return await apiFetch<ComboPaginate>(url);
  },
  getById: async (id: number): Promise<Combo> => {
    return await apiFetch(`/combos/${id}`);
  },
};
