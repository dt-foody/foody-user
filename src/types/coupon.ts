// src/types/coupon.ts
import type { Paginated } from "@/lib";

// ====== Enums / Unions khớp backend ======
export type CouponType = "discount_code" | "freeship" | "referral";
export type CouponValueType = "fixed_amount" | "percentage" | "gift_item";
export type CouponStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "EXPIRED";
export type GiftType = "Product" | "Combo";

// ====== Điều kiện động (runtime condition JSON) ======
export interface CouponConditionClause {
  field: string; // ví dụ: "user.isNew", "order.total", "order.categoryIds"
  operator:
    | "="
    | "!="
    | ">"
    | ">="
    | "<"
    | "<="
    | "in"
    | "nin"
    | "contains"
    | "regex"
    | "exists"
    | "equals";
  value: unknown;
}

// Cho phép lồng nhóm and/or
export type CouponConditionNode = CouponConditionClause | CouponConditionGroup;
export type CouponConditionGroup =
  | { and: CouponConditionNode[] }
  | { or: CouponConditionNode[] };

// Public: điều kiện gốc là một group (and/or)
export type CouponCondition = CouponConditionGroup;

export interface CouponGiftItem {
  item: any; // Object or Id của Product hoặc Combo
  itemType: GiftType; // 'Product' hoặc 'Combo'
  price: number; // Giá bán ưu đãi (0 = Miễn phí)
  image?: string;
  name?: string;
}

// ====== Coupon chính ======
export interface Coupon {
  id: string;
  name: string;
  description?: string;

  code?: string | null;
  type: CouponType;

  value: number;
  valueType: CouponValueType;
  maxDiscountAmount?: number;
  minOrderAmount?: number;

  giftItems?: CouponGiftItem[];

  startDate: string;
  endDate: string;

  // Limits
  maxUses?: number;
  usedCount?: number;
  maxUsesPerUser?: number;

  // Hiển thị / hành vi
  public?: boolean;
  claimable?: boolean;
  autoApply?: boolean;
  stackable?: boolean;

  // Điều kiện runtime
  conditions?: CouponCondition | CouponConditionNode[] | null; // hỗ trợ legacy: mảng node => coi như and

  // Trạng thái
  status: CouponStatus;

  // Audit
  createdBy?: string | { id: string; name?: string; email?: string } | null;
  createdAt: string;
  updatedAt: string;

  // 🔥 [MỚI] Bổ sung các trường cho Personal Voucher
  voucherId?: string; // ID của voucher cụ thể (trong bảng Vouchers)
  voucherCode?: string; // Mã code riêng (VD: EVERY_ONE_11-FTUDM1)
  couponScope?: "PUBLIC" | "PERSONAL";
}

// ====== Paginated response ======
export type CouponPaginate = Paginated<Coupon>;
