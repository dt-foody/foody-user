import { Customer } from "./customer";
import { Employee } from "./employee";

// src/types/user.ts
export interface User {
  id: string; // mapped from id/_id on fetch
  email: string;
  role: "customer" | "staff" | "admin" | "manager";
  isEmailVerified: boolean;

  // IDs from backend (ObjectId as string)
  rolesCustom: string[];
  extraPermissions: string[];
  excludePermissions: string[];

  // ISO timestamps from API
  createdAt?: string;
  updatedAt?: string;

  // optional display fields if your API adds them
  name?: string;
  avatar?: string;
}

export interface GetMeResponse {
  user: User,
  me: Customer | Employee,
  permissions: []
}
