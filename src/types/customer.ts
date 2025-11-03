// src/types/customer.ts
import type { Paginated } from "@/lib";
import type { User } from "./user";

export type Gender = "male" | "female" | "other";

export interface GeoPoint {
  type: "Point";
  /** [lng, lat] */
  coordinates: [number, number];
}

export interface CustomerAddress {
  label?: string;
  recipientName: string;
  recipientPhone: string;
  street: string;
  ward: string;
  city: string;
  fullAddress?: string;
  location?: GeoPoint;
  isDefault: boolean;
}

export interface Customer {
  /** mapped from _id */
  id: string;

  /** auto-increment from BE */
  customerId: number;

  /** reference to User (ObjectId string or populated) */
  user?: string | User;

  // Basic profile
  name: string;
  phone: string;
  gender: Gender;
  /** ISO date string (YYYY-MM-DD or full ISO) */
  birthDate?: string;

  // Addresses
  addresses: CustomerAddress[];

  // Meta
  isActive: boolean;
  /** ISO date string */
  lastOrderDate?: string;

  // Audit / soft delete
  createdBy?: string | User;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string | User;

  // Timestamps (ISO)
  createdAt?: string;
  updatedAt?: string;
}

/** Standard paginated response shape */
export type CustomerPaginate = Paginated<Customer>;

/** Form hiển thị/sửa cho trang Account */
export type CustomerForm = Pick<
  Customer,
  "name" | "phone" | "gender" | "birthDate" | "addresses"
> & {
  /** Chỉ để hiển thị, lấy từ User */
  email: string;
};

/** Payload update gửi lên BE (không có email) */
export type UpdateCustomerInput = Partial<
  Pick<Customer, "name" | "phone" | "gender" | "birthDate" | "addresses">
>;
