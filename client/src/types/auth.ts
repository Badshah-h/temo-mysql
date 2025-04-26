export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  role?: string; // Primary role (for backward compatibility)
  roles?: Role[]; // All roles assigned to the user
  permissions?: Permission[]; // All permissions the user has through roles
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  token: string;
  user: User;
}
