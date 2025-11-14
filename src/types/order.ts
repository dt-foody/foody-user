// /types/order.ts (Hoặc file .d.ts của bạn)

import type { Paginated } from "@/lib";
import type { Customer } from "./customer"; // Giả định bạn có type này
import { Product } from "./product";

/** ========================================================================
 * 1. ENUMS (Đồng bộ với Model)
 * ======================================================================== */

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "ready"
  | "delivering"
  | "completed"
  | "canceled"
  | "refunded";

export type PaymentMethod =
  | "cash"
  | "payos"
  | "momo"
  | "vnpay"
  | "bank_transfer";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type ShippingStatus =
  | "pending"
  | "preparing"
  | "delivering"
  | "delivered"
  | "failed"
  | "canceled";

/** ========================================================================
 * 2. DB MODEL TYPES (Dữ liệu trả về từ API)
 * ======================================================================== */

/**
 * Tùy chọn SẢN PHẨM (đã lưu trong DB - cấu trúc phẳng)
 */
export interface OrderItemOption {
  groupName: string;
  optionName: string;
  priceModifier: number;
}

/**
 * Lựa chọn COMBO (đã lưu trong DB - cấu trúc phẳng)
 */
export interface OrderItemComboSelection {
  slotName: string;
  product: string; // <-- Sửa lại: Đây là ID (string)
  productName: string; // Tên snapshot
  productPopulated?: Product; // <-- Đổi tên: Dành cho dữ liệu populate
  options: OrderItemOption[];
}

/**
 * Một MỤC HÀNG trong đơn hàng (đã lưu trong DB)
 */
export interface OrderItem {
  id: string; // _id của OrderItem
  item: string; // ObjectId của Product hoặc Combo
  itemType: "Product" | "Combo";
  name: string; // Tên snapshot
  quantity: number;
  basePrice: number; // Giá gốc
  price: number; // Giá bán cuối cùng của 1 item
  options: OrderItemOption[]; // Dùng khi itemType == 'Product'
  comboSelections: OrderItemComboSelection[]; // Dùng khi itemType == 'Combo'
  note?: string;
}

/** Thông tin thanh toán (đã lưu trong DB) */
export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  checkoutUrl?: string;
  qrCode?: string; // <-- THÊM: Đồng bộ với model
}

/** Địa chỉ giao hàng */
export interface ShippingAddress {
  label?: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  ward: string;
  district: string;
  city: string;
}

/** Thông tin giao hàng (đã lưu trong DB) */
export interface ShippingInfo {
  address: ShippingAddress;
  status: ShippingStatus;
}

// <-- THÊM MỚI 1: Type cho coupon đã lưu trong DB
/**
 * Snapshot coupon đã áp dụng (lưu trong DB)
 * Khớp với backend model
 */
export interface AppliedCouponInfo {
  id: string; // ObjectId của Coupon
  code: string;
  type: string;
  value: number;
}

/**
 * Đối tượng ORDER đầy đủ (đã lưu trong DB)
 */
export interface Order {
  id: string; // Map từ _id
  orderId: number; // ID tăng tự động
  orderCode?: number; // <-- THÊM: Mã dùng cho PayOS
  profile?: string | Customer; // ObjectId hoặc đã populate
  profileType?: "Customer" | "Employee";
  items: OrderItem[];
  totalAmount: number;
  discountAmount: number;
  shippingFee: number;
  grandTotal: number;
  payment: PaymentInfo;
  shipping?: ShippingInfo | null;
  status: OrderStatus;
  note?: string;
  appliedCoupons?: AppliedCouponInfo[]; // <-- THÊM MỚI 2: Thêm trường coupon
  createdBy?: string;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export type OrderPaginate = Paginated<Order>;

/** ========================================================================
 * 3. FRONTEND PAYLOAD TYPES (Dữ liệu gửi lên API để TẠO MỚI)
 * ======================================================================== */

/**
 * Snapshot của một mục (Product/Combo)
 */
export interface CreateOrderItem_ItemSnapshot {
  id: string;
  name: string;
  basePrice?: number; // Dùng cho Product
  comboPrice?: number; // Dùng cho Combo
}

/**
 * Snapshot của một TÙY CHỌN (VD: "L", "+5000đ")
 */
export interface CreateOrderItem_Option {
  name: string;
  priceModifier: number;
}

/**
 * Snapshot của một LỰA CHỌN TRONG COMBO (VD: chọn "Coca" cho slot "Đồ uống")
 */
export interface CreateOrderItem_ComboSelection {
  slotName: string;
  product: {
    id: string;
    name: string;
    basePrice: number;
  };
  // Tùy chọn cho sản phẩm con đó (VD: Coca Size L)
  options: Record<string, CreateOrderItem_Option[]>;
}

/**
 * Payload cho MỘT MỤC HÀNG khi tạo đơn
 * (Khớp với createOrderItemSchema của Joi)
 */
export interface CreateOrderItem {
  item: CreateOrderItem_ItemSnapshot;
  itemType: "Product" | "Combo";
  quantity: number;
  totalPrice: number; // Giá cuối cùng đã tính
  note?: string;
  options?: Record<string, CreateOrderItem_Option[]>; // Dùng cho Product
  comboSelections?: CreateOrderItem_ComboSelection[]; // Dùng cho Combo
  cartId?: string; // <-- THÊM: Gửi lên cho tiện, dù BE không dùng
}

// <-- THÊM MỚI 3: Type cho coupon gửi đi
/**
 * Payload cho coupon khi tạo đơn
 * (Khớp với appliedCouponSchema của Joi)
 */
export interface CreateOrder_AppliedCoupon {
  id: string;
  code: string;
}

/**
 * Payload TỔNG khi khách hàng tạo đơn
 * (Khớp với customerOrder validation)
 */
export interface CreateOrderInput {
  items: CreateOrderItem[];
  appliedCoupons?: CreateOrder_AppliedCoupon[]; // <-- THÊM MỚI 4
  totalAmount: number;
  discountAmount?: number;
  shippingFee?: number;
  grandTotal: number;
  payment: Pick<PaymentInfo, "method">; // Chỉ gửi method
  shipping?: ShippingInfo | null; // Gửi cả address và status (hoặc null)
  note?: string;
}
