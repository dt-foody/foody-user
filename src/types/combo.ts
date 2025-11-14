// src/types/combo.ts
import type { Paginated } from "@/lib";
// Giả định import từ file 'product' (dựa trên file gốc)
import type { Product } from "./product";

/**
 * MỚI: Enum định nghĩa 3 chế độ tính giá
 */
export enum ComboPricingMode {
  FIXED = "FIXED",
  SLOT_PRICE = "SLOT_PRICE",
  DISCOUNT = "DISCOUNT",
}

/**
 * MỚI: Enum định nghĩa loại giảm giá
 */
export enum DiscountType {
  PERCENT = "PERCENT",
  AMOUNT = "AMOUNT",
  NONE = "NONE", // Mặc định khi không phải MODE_DISCOUNT
}

/**
 * REFACTORED: Cập nhật theo model mới
 * Product nên là type 'Product' thay vì 'any'
 */
export interface ComboSelectableProduct {
  product: Product;
  snapshotPrice: number; // Giá gốc của product (dùng cho mode DISCOUNT)
  additionalPrice: number; // Giá phụ thu (luôn cộng thêm)
  slotPrice: number; // Giá khi chọn (dùng cho mode SLOT_PRICE)
}

/**
 * REFACTORED: Cập nhật theo model mới
 */
export interface ComboItem {
  slotName: string;
  selectableProducts: ComboSelectableProduct[];
  minSelection: number; // Thay cho isRequired
  maxSelection: number; // Mới: hỗ trợ multi-select
}

/**
 * REFACTORED: Cập nhật Combo interface
 */
export interface Combo {
  id: string;
  name: string;
  description?: string;
  image?: string;
  startDate: Date | string; // Đơn giản hoá
  endDate: Date | string; // Đơn giản hoá
  items: ComboItem[];
  isActive: boolean;
  priority: number;
  createdAt?: string;
  updatedAt?: string;

  // --- CÁC TRƯỜNG MỚI ĐÃ REFACTOR ---
  pricingMode: ComboPricingMode;
  comboPrice: number; // Vẫn dùng cho MODE_FIXED

  /** MỚI: Loại giảm giá (PERCENT | AMOUNT | NONE) */
  discountType: DiscountType;
  /** MỚI: Giá trị giảm (VD: 30 (cho 30%) hoặc 20000 (cho 20k VND)) */
  discountValue: number;

  /**
   * CẬP NHẬT (THEO YÊU CẦU CỦA BẠN):
   * Backend phải tính giá này dựa trên:
   * - (SLOT_PRICE): Tổng min(slotPrice) của các slot.
   * - (DISCOUNT): Tổng min(snapshotPrice) của các slot, sau đó áp dụng discount.
   */
  minPrice?: number;
}

/** Response phân trang dùng chung (Giữ nguyên từ file cũ) */
export type ComboPaginate = Paginated<Combo>;
