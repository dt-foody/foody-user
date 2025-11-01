// src/types/employee.ts
import type { Paginated } from "@/lib";
import type { User } from "./user";
import type { Gender, CustomerAddress } from "./customer";

/** Tái sử dụng cấu trúc địa chỉ từ Customer */
export type EmployeeAddress = CustomerAddress;

export interface Employee {
  /** mapped from _id */
  id: string;

  /** auto-increment từ BE */
  employeeId: number;

  /** tham chiếu User (ObjectId string hoặc object đã populate) */
  user?: string | User;

  // Hồ sơ cơ bản
  name: string;
  phone: string;
  gender: Gender;
  /** ISO date string */
  birthDate?: string;

  // Địa chỉ (tương tự customer)
  addresses: EmployeeAddress[];

  // Meta
  isActive: boolean;

  // Audit / soft delete
  createdBy?: string | User;
  isDeleted: boolean;
  deletedAt?: string;
  deletedBy?: string | User;

  // Timestamps (ISO string)
  createdAt?: string;
  updatedAt?: string;
}

/** Paginated response tiêu chuẩn cho Employee */
export type EmployeePaginate = Paginated<Employee>;
