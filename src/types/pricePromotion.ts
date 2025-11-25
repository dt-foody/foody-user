// src/types/pricePromotion.ts
import { Paginated } from "@/lib";
import { Combo } from "./combo";
import { Product } from "./product";

// Khớp với BE: 'percentage' | 'fixed_amount'
export type PricePromotionDiscountTypeBE = "percentage" | "fixed_amount";

export interface PricePromotion {
  id: string;
  name: string;
  description?: string;

  // Một trong hai (product XOR combo)
  product?: Product | string;
  combo?: Combo | string;

  discountType: PricePromotionDiscountTypeBE;
  discountValue: number;
  maxDiscountAmount: number;

  startDate: string;
  endDate: string;
  isActive: boolean;

  // Optional từ BE (limit/usage)
  maxQuantity?: number;
  usedQuantity?: number;
  dailyMaxUses?: number;
  lastUsedDate?: string | null;
  dailyUsedCount?: number;

  // Audit / soft-delete / timestamps
  createdBy?: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

export type PricePromotionPaginate = Paginated<PricePromotion>;
