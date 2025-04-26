import { db } from "../../db";
import { Permission } from "../../types";

export const PermissionService = {
  /**
   * Find permission by ID
   */
  findById: async (id: number): Promise<Permission | null> => {
    try {
      const permission = await db("permissions")
        .where("id", id)
        .select(
          "id",
          "name",
          "description",
          "category",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      return permission || null;
    } catch (error) {
      console.error("Error finding permission by ID:", error);
      throw error;
    }
  },

  /**
   * Find permission by name
   */
  findByName: async (name: string): Promise<Permission | null> => {
    try {
      const permission = await db("permissions")
        .where("name", name)
        .select(
          "id",
          "name",
          "description",
          "category",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      return permission || null;
    } catch (error) {
      console.error("Error finding permission by name:", error);
      throw error;
    }
  },

  /**
   * Get all permissions
   */
  findAll: async (): Promise<Permission[]> => {
    try {
      const permissions = await db("permissions").select(
        "id",
        "name",
        "description",
        "category",
        "created_at as createdAt",
        "updated_at as updatedAt",
      );

      return permissions;
    } catch (error) {
      console.error("Error finding all permissions:", error);
      throw error;
    }
  },

  /**
   * Create a new permission
   */
  create: async (permissionData: {
    name: string;
    description?: string;
    category?: string;
  }): Promise<Permission> => {
    try {
      const [id] = await db("permissions").insert({
        name: permissionData.name,
        description: permissionData.description,
        category: permissionData.category,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return PermissionService.findById(id) as Promise<Permission>;
    } catch (error) {
      console.error("Error creating permission:", error);
      throw error;
    }
  },

  /**
   * Update permission
   */
  update: async (
    id: number,
    permissionData: {
      name?: string;
      description?: string;
      category?: string;
    },
  ): Promise<Permission | null> => {
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (permissionData.name) updateData.name = permissionData.name;
      if (permissionData.description !== undefined)
        updateData.description = permissionData.description;
      if (permissionData.category !== undefined)
        updateData.category = permissionData.category;

      await db("permissions").where("id", id).update(updateData);

      return PermissionService.findById(id);
    } catch (error) {
      console.error("Error updating permission:", error);
      throw error;
    }
  },

  /**
   * Delete permission
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await db("permissions").where("id", id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting permission:", error);
      throw error;
    }
  },

  /**
   * Get roles with permission
   */
  getRoles: async (
    permissionId: number,
  ): Promise<{ id: number; name: string; description?: string }[]> => {
    try {
      const roles = await db("roles")
        .select("roles.id", "roles.name", "roles.description")
        .join("role_permissions", "roles.id", "role_permissions.role_id")
        .where("role_permissions.permission_id", permissionId);

      return roles;
    } catch (error) {
      console.error("Error getting roles with permission:", error);
      throw error;
    }
  },

  /**
   * Check if user has permission
   */
  userHasPermission: async (
    userId: number,
    permissionName: string,
  ): Promise<boolean> => {
    try {
      const result = await db("permissions")
        .join(
          "role_permissions",
          "permissions.id",
          "role_permissions.permission_id",
        )
        .join("user_roles", "role_permissions.role_id", "user_roles.role_id")
        .where({
          "user_roles.user_id": userId,
          "permissions.name": permissionName,
        })
        .first();

      return !!result;
    } catch (error) {
      console.error("Error checking if user has permission:", error);
      return false;
    }
  },
};
