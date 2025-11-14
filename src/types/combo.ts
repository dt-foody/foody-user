// src/types/combo.ts
import type { Paginated } from "@/lib";
import { Product } from "./product";

/** Phần tử có thể chọn trong 1 slot của combo (đã ép về id) */
export interface ComboSelectableProduct {
  product: Product;
  fixedPrice: number; // giá cố định khi nằm trong combo
  additionalPrice: number; // giá phụ thu khi nằm trong combo
  maxQuantity: number; // mặc định 1
}

/** Slot trong combo (VD: Đồ uống, Món phụ, ... ) */
export interface ComboItem {
  slotName: string;
  isRequired: boolean; // bắt buộc chọn ít nhất 1?
  selectableProducts: ComboSelectableProduct[];
}

/** Combo đọc-chỉ cho phía user */
export interface Combo {
  id: string;
  name: string;
  description?: string;
  image?: string;

  comboPrice: number;

  startDate: string; // ISO
  endDate: string; // ISO

  items: ComboItem[];

  isActive: boolean;
  priority: number;

  // optional cho hiển thị/log
  createdAt?: string;
  updatedAt?: string;
}

/** Response phân trang dùng chung */
export type ComboPaginate = Paginated<Combo>;
