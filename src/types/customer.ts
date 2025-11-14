// src/types/customer.ts
// ======================
// Full Customer TypeScript Definitions (Next.js) – 100% synced with Backend Schema
// ======================

import type { Paginated } from "@/lib";
import type { User } from "./user";

//
// ────────────────────────────────────────────
//  GENDER
// ────────────────────────────────────────────
//

export type Gender = "male" | "female" | "other";

//
// ────────────────────────────────────────────
//  GEO POINT
// ────────────────────────────────────────────
//

export interface GeoPoint {
  type: "Point";
  /** [lng, lat] */
  coordinates: [number, number];
}

//
// ────────────────────────────────────────────
//  EMAIL ITEM (mảng emails)
// ─────────────────────────────────────────────
//

export type EmailType = "Home" | "Company" | "Other";

export interface CustomerEmail {
  type: EmailType;
  value: string;
  isPrimary: boolean;
}

//
// ────────────────────────────────────────────
//  PHONE ITEM (mảng phones)
// ─────────────────────────────────────────────
//

export type PhoneType = "Home" | "Company" | "Other";

export interface CustomerPhone {
  type: PhoneType;
  value: string;
  isPrimary: boolean;
}

//
// ────────────────────────────────────────────
//  CUSTOMER ADDRESS
// ─────────────────────────────────────────────
//

export interface CustomerAddress {
  label?: string;

  recipientName: string;
  recipientPhone: string;

  street: string;
  ward: string;
  district: string;
  city: string;

  fullAddress?: string;
  location?: GeoPoint;

  isDefault: boolean;
}

//
// ────────────────────────────────────────────
//  MAIN CUSTOMER MODEL (đúng 100% backend)
// ─────────────────────────────────────────────
//

export interface Customer {
  /** mapped from _id */
  id: string;

  /** auto-increment from BE */
  customerId: number;

  /** reference to User (ObjectId string hoặc populated User) */
  user?: string | User;

  // --- Basic profile ---
  name: string;
  gender: Gender;
  /** ISO string */
  birthDate?: string;

  // --- Contact ---
  emails: CustomerEmail[];
  phones: CustomerPhone[];

  // --- Addresses ---
  addresses: CustomerAddress[];

  // --- Meta ---
  isActive: boolean;
  lastOrderDate?: string;

  // --- Audit / Soft Delete ---
  createdBy?: string | User;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string | User;

  // --- Timestamps ---
  createdAt?: string;
  updatedAt?: string;
}

//
// ────────────────────────────────────────────
//  PAGINATION RESPONSE
// ─────────────────────────────────────────────
//

export type CustomerPaginate = Paginated<Customer>;

//
// ────────────────────────────────────────────
//  CUSTOMER FORM (FE sử dụng để hiển thị/sửa)
// ─────────────────────────────────────────────
//

export type CustomerForm = Pick<
  Customer,
  "name" | "gender" | "birthDate" | "addresses" | "emails" | "phones"
> & {
  /** Email & phone chính – FE tự chọn từ mảng emails/phones */
  primaryEmail: string;
  primaryPhone: string;
};

//
// ────────────────────────────────────────────
//  UPDATE PAYLOAD (gửi lên BE)
// ─────────────────────────────────────────────
//

export type UpdateCustomerInput = Partial<
  Pick<
    Customer,
    "name" | "gender" | "birthDate" | "addresses" | "emails" | "phones"
  >
>;
