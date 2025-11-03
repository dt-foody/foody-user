import { UpdateCustomerInput, Customer } from "@/types";
import { apiFetch } from "@/lib/api"; // Giả sử apiFetch là một hàm gọi API chuẩn.

export const customerService = {
  updateProfile: async (data: UpdateCustomerInput): Promise<Customer> => {
    return await apiFetch(`/customers`, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },
};
