import { apiClient } from "./index";
import { Role, Permission } from "../types/auth";

export interface CreateRoleRequest {
  name: string;
  description?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
}

export const rolesApi = {
  /**
   * Get all roles
   */
  getAll: (): Promise<Role[]> => {
    return apiClient.get<Role[]>("/roles");
  },

  /**
   * Get role by ID
   */
  getById: (id: number): Promise<Role> => {
    return apiClient.get<Role>(`/roles/${id}`);
  },

  /**
   * Create a new role
   */
  create: (data: CreateRoleRequest): Promise<Role> => {
    return apiClient.post<Role>("/roles", data);
  },

  /**
   * Update role
   */
  update: (id: number, data: UpdateRoleRequest): Promise<Role> => {
    return apiClient.put<Role>(`/roles/${id}`, data);
  },

  /**
   * Delete role
   */
  delete: (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/roles/${id}`);
  },

  /**
   * Get role permissions
   */
  getPermissions: (id: number): Promise<Permission[]> => {
    return apiClient.get<Permission[]>(`/roles/${id}/permissions`);
  },

  /**
   * Assign permission to role
   */
  assignPermission: (
    id: number,
    permissionId: number,
  ): Promise<{ message: string; permissions: Permission[] }> => {
    return apiClient.post<{ message: string; permissions: Permission[] }>(
      `/roles/${id}/permissions`,
      { permissionId },
    );
  },

  /**
   * Remove permission from role
   */
  removePermission: (
    id: number,
    permissionId: number,
  ): Promise<{ message: string; permissions: Permission[] }> => {
    return apiClient.delete<{ message: string; permissions: Permission[] }>(
      `/roles/${id}/permissions/${permissionId}`,
    );
  },

  /**
   * Get users with role
   */
  getUsers: (
    id: number,
  ): Promise<{ id: number; email: string; fullName: string }[]> => {
    return apiClient.get<{ id: number; email: string; fullName: string }[]>(
      `/roles/${id}/users`,
    );
  },
};
