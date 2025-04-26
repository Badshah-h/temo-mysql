import { apiClient } from "./index";
import { User } from "../types/auth";

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface UpdateUserRequest {
  email?: string;
  fullName?: string;
  password?: string;
}

export const usersApi = {
  /**
   * Get all users
   */
  getAll: (): Promise<User[]> => {
    return apiClient.get<User[]>("/users");
  },

  /**
   * Get user by ID
   */
  getById: (id: number): Promise<User> => {
    return apiClient.get<User>(`/users/${id}`);
  },

  /**
   * Create a new user
   */
  create: (data: CreateUserRequest): Promise<User> => {
    return apiClient.post<User>("/users", data);
  },

  /**
   * Update user
   */
  update: (id: number, data: UpdateUserRequest): Promise<User> => {
    return apiClient.put<User>(`/users/${id}`, data);
  },

  /**
   * Delete user
   */
  delete: (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/users/${id}`);
  },

  /**
   * Get user roles
   */
  getRoles: (id: number): Promise<any[]> => {
    return apiClient.get<any[]>(`/users/${id}/roles`);
  },

  /**
   * Assign role to user
   */
  assignRole: (
    id: number,
    roleId: number,
  ): Promise<{ message: string; roles: any[] }> => {
    return apiClient.post<{ message: string; roles: any[] }>(
      `/users/${id}/roles`,
      { roleId },
    );
  },

  /**
   * Remove role from user
   */
  removeRole: (
    id: number,
    roleId: number,
  ): Promise<{ message: string; roles: any[] }> => {
    return apiClient.delete<{ message: string; roles: any[] }>(
      `/users/${id}/roles/${roleId}`,
    );
  },
};
