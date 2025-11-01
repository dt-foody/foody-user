import { Coupon, CouponPaginate } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const couponService = {
  getAll: async (query: { [key: string]: any }): Promise<CouponPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/coupons?${queryString}`;

    return await apiFetch<CouponPaginate>(url);
  },
  getById: async (id: number): Promise<Coupon> => {
    return await apiFetch(`/coupons/${id}`);
  },
  getAvailables: async (query: { [key: string]: any }): Promise<CouponPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/coupons/available?${queryString}`;

    return await apiFetch<CouponPaginate>(url);
  },
  validate: async (code: string): Promise<Coupon> => {
    return await apiFetch(`/coupons/validate/${code}`);
  }
};
