// Common types used throughout the application

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  password?: string;
  role?: string; // Primary role (for backward compatibility)
  roles?: Role[]; // All roles assigned to the user
  permissions?: Permission[]; // All permissions the user has through roles
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResponseFormat {
  id: number;
  name: string;
  description?: string;
  structure: string; // JSON string
  category?: string;
  tags?: string; // JSON string
  isGlobal: boolean;
  usageCount: number;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string; // JSON string
  isGlobal: boolean;
  responseFormatId?: number;
  usageCount: number;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  id: number;
  userId: number;
  templateId: number;
  responseFormatId?: number;
  query: string;
  response: string; // JSON string
  rawResponse?: string;
  variables: string; // JSON string
  createdAt: Date;
}

export interface WidgetConfig {
  id: number;
  userId: number;
  name: string;
  config: string; // JSON string
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface APIResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  status: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
