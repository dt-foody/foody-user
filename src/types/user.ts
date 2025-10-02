// Base User type
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// User roles
export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  MODERATOR = 'MODERATOR',
}

// DTOs cho API requests
export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  avatar?: string;
  role?: UserRole;
  isActive?: boolean;
}

export interface LoginDto {
  email: string;
  password: string;
}

// API Response types
export interface UserResponse {
  user: User;
  message?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
}