import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.
import { DealSettingPaginate } from "@/types/dealSetting";

export const dealSettingService = {
  getAll: async (query: {
    [key: string]: any;
  }): Promise<DealSettingPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/deal-settings?${queryString}`;

    return await apiFetch<DealSettingPaginate>(url);
  },
};
