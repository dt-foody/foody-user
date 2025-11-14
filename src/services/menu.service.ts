import { GroupedCategory, Product, ProductPaginate } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export interface MenuApiResponse {
  flashSales: any[];
  flashSaleCategory: any;
  thucDon: any[];
  combos: any[];
}


export const menuService = {
  getMenu: async (query: { [key: string]: any }): Promise<MenuApiResponse> => {
    return await apiFetch<MenuApiResponse>('/menu');
  },
};
