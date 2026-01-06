import { UpdateCustomerInput, Customer, ReferralPaginate } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const customerService = {
  updateProfile: async (data: UpdateCustomerInput): Promise<Customer> => {
    return await apiFetch(`/customers`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
  getReferrals: async (query: {
    [key: string]: any;
  }): Promise<ReferralPaginate> => {
    const queryString = new URLSearchParams(query).toString();
    const url = `/customers/referral?${queryString}`;
    return await apiFetch<ReferralPaginate>(url);
  },
};
