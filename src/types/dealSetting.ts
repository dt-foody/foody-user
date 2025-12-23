// src/types/dealSetting.ts
import type { Paginated } from "@/lib";

export interface DealSetting {
  id: string;

  // Cấu hình Giao hàng
  allowFastDelivery: boolean;      // Bật/tắt giao hàng nhanh (Hỏa tốc)
  allowScheduledDelivery: boolean; // Bật/tắt giao hàng sau (Hẹn giờ)

  // Cấu hình Thanh toán
  allowCashPayment: boolean;       // Bật/tắt thanh toán tiền mặt (COD)
  allowBankTransfer: boolean;      // Bật/tắt thanh toán chuyển khoản (PayOS/Bank)

  // Audit (Đúng chuẩn Backend Model)
  createdAt: string; // ISO Date String
  updatedAt: string; // ISO Date String
}

export type DealSettingPaginate = Paginated<DealSetting>;