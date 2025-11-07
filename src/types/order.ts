import type { Paginated } from "@/lib";
import type { Customer } from "./customer";

/** --- ORDER TYPES --- **/

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "delivering"
  | "completed"
  | "canceled";

export type PaymentMethod = "cash" | "payos" | "momo" | "vnpay";
export type PaymentStatus = "pending" | "paid" | "failed";
export type ShippingStatus = "pending" | "delivering" | "delivered" | "failed";

export interface OrderItem {
  product: string; // ObjectId
  name: string;
  quantity: number;
  price: number;
  note?: string;
  combo?: string | null;
}

export interface PaymentInfo {
  method: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  qrCode?: string;
  checkoutUrl?: string;
}

export interface ShippingAddress {
  label?: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  ward: string;
  city: string;
  fullAddress?: string;
}

export interface ShippingInfo {
  address: ShippingAddress;
  status?: ShippingStatus;
}

export interface Order {
  /** mapped from _id */
  id: string;

  /** auto increment or generated */
  orderCode: number;

  /** customer reference (ObjectId string or populated) */
  customer: string | Customer;

  /** order items */
  items: OrderItem[];

  /** total before discounts */
  totalAmount: number;
  /** discount total */
  discountAmount: number;
  /** shipping fee */
  shippingFee: number;
  /** final total */
  grandTotal: number;

  payment: PaymentInfo;
  shipping: ShippingInfo;

  status: OrderStatus;
  note?: string;

  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** Paginated list shape */
export type OrderPaginate = Paginated<Order>;

/** Payload khi tạo đơn hàng từ frontend */
export interface CreateOrderInput {
  items: OrderItem[];
  totalAmount: number;
  discountAmount?: number;
  shippingFee?: number;
  grandTotal: number;
  payment: Pick<PaymentInfo, "method">;
  shipping: ShippingInfo;
  note?: string;
}
