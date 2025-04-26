import { apiClient } from "./index";
import { Permission } from "../types/auth";

export interface CreatePermissionRequest {
  name: string;
  description?: string;
  category?: string;
}

export interface UpdatePermissionRequest {
  name?: string;
  description?: string;
  category?: string;
}

export const permissionsApi = {
  /**
   * Get all permissions
   */
  getAll: (): Promise<Permission[]> => {
    return apiClient.get<Permission[]>("/permissions");
  },

  /**
   * Get permission by ID
   */
  getById: (id: number): Promise<Permission> => {
    return apiClient.get<Permission>(`/permissions/${id}`);
  },

  /**
   * Create a new permission
   */
  create: (data: CreatePermissionRequest): Promise<Permission> => {
    return apiClient.post<Permission>("/permissions", data);
  },

  /**
   * Update permission
   */
  update: (id: number, data: UpdatePermissionRequest): Promise<Permission> => {
    return apiClient.put<Permission>(`/permissions/${id}`, data);
  },

  /**
   * Delete permission
   */
  delete: (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/permissions/${id}`);
  },

  /**
   * Get roles with permission
   */
  getRoles: (
    id: number,
  ): Promise<{ id: number; name: string; description?: string }[]> => {
    return apiClient.get<{ id: number; name: string; description?: string }[]>(
      `/permissions/${id}/roles`,
    );
  },
};
