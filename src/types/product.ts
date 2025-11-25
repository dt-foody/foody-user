// src/types/product.ts
import type { Paginated } from "@/lib";
import { Category } from "./category";
import { PricePromotion } from "./pricePromotion";

// ===== Option Types =====
export type OptionPriceType = "fixed_amount" | "percentage";

export interface OptionItem {
  name: string;
  priceModifier: number; // (đồng) hoặc (%)
  type: OptionPriceType; // fixed_amount | percentage
  isActive: boolean;
  priority: number;
}

export interface OptionGroup {
  name: string;
  minOptions: number;
  maxOptions: number;
  priority: number;
  options: OptionItem[];
}

// ===== Product from API (BE) =====
export interface Product {
  id: string;
  name: string;
  description: string;
  
  basePrice: number;
  salePrice?: number;
  promotion?: PricePromotion;

  image: string;
  category: string | Category | null;
  isActive: boolean;
  priority: number;
  optionGroups?: OptionGroup[];

  // Optional từ BE (timestamps + audit)
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

// ===== UI Projection (MenuItem) =====
export type MenuItemType = "product" | "combo";

export interface MenuItem extends Product {
  // UI-specific (được map từ Product + promotion)
  price: number; // giá hiện tại để hiển thị (basePrice hoặc đã apply khuyến mãi)
  originalPrice?: number; // giá gốc (để gạch ngang)
  type: MenuItemType;
  discount?: PricePromotion | null;

  // Optional analytics/UI
  reviews: number;
  rating: number | string;
  sold?: number;
  timeLeft?: string;

  // Dùng cho coupon filter (nếu cần nhiều category, FE có thể enrich)
  categoryIds?: string[];
}

export type ProductPaginate = Paginated<Product>;

export interface GroupedCategory {
  category: Category | null; // phòng trường hợp category bị null
  totalProducts: number;
  products: Product[];
}
