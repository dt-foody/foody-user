import { Order, OrderPaginate, CreateOrderInput } from "@/types";
import { apiFetch } from "@/lib/api";

/**
 * Order Service
 * Gọi API liên quan đến đơn hàng
 * Dùng apiFetch (wrapper fetch thô) cho tất cả các request
 */
export const orderService = {
  /** 🟡 Lấy danh sách đơn hàng (có phân trang + filter) */
  async paginate(params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    sortBy?: string;
  }): Promise<OrderPaginate> {
    const query = new URLSearchParams(
      Object.entries(params || {}).reduce((acc, [key, val]) => {
        if (val !== undefined && val !== null && val !== "") acc[key] = String(val);
        return acc;
      }, {} as Record<string, string>)
    );

    return apiFetch(`/orders?${query.toString()}`, {
      method: "GET",
    });
  },

  /** 🔵 Lấy chi tiết đơn hàng */
  async getById(id: string): Promise<Order> {
    return apiFetch(`/orders/${id}`, { method: "GET" });
  },

  async getByCode(code: string): Promise<Order> {
    return apiFetch(`/orders/${code}/by-code`, { method: "GET" });
  },

  /** 🟠 Cập nhật đơn hàng */
  async update(id: string, payload: Partial<Order>): Promise<Order> {
    return apiFetch(`/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  /** 🔴 Xóa đơn hàng */
  async delete(id: string): Promise<{ success: boolean }> {
    return apiFetch(`/orders/${id}`, {
      method: "DELETE",
    });
  },

  /** 🧾 Khách hàng tạo đơn (Checkout, có thể thanh toán qua PayOS hoặc COD) */
  async customerOrder(data: CreateOrderInput): Promise<{
    message: string;
    order: Order;
    qrInfo?: {
      transactionId?: string;
      qrCode?: string;
      checkoutUrl?: string;
    };
  }> {
    return apiFetch("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },
  async anonymousOrder(data: CreateOrderInput): Promise<{
    message: string;
    order: Order;
    qrInfo?: {
      transactionId?: string;
      qrCode?: string;
      checkoutUrl?: string;
    };
  }> {
    return apiFetch("/orders/anonymous", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  },

  /** 🚚 Tính phí vận chuyển từ toạ độ */
  async getShippingFee(payload: {
    lat: number;
    lng: number;
    orderTime?: string;
    items?: any[];
    totalAmount?: number;
  }): Promise<{ distance: number; shippingFee: number }> {
    return apiFetch(`/orders/shipping-fee`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  },

  async getSurcharges(): Promise<{ results: any[] }> {
    return apiFetch("/surcharges?limit=1000", { method: "GET" });
  }
};
