import { db } from "../../db";
import { Role, Permission } from "../../types";

export const RoleService = {
  /**
   * Find role by ID
   */
  findById: async (id: number): Promise<Role | null> => {
    try {
      const role = await db("roles")
        .where("id", id)
        .select(
          "id",
          "name",
          "description",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      return role || null;
    } catch (error) {
      console.error("Error finding role by ID:", error);
      throw error;
    }
  },

  /**
   * Find role by name
   */
  findByName: async (name: string): Promise<Role | null> => {
    try {
      const role = await db("roles")
        .where("name", name)
        .select(
          "id",
          "name",
          "description",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      return role || null;
    } catch (error) {
      console.error("Error finding role by name:", error);
      throw error;
    }
  },

  /**
   * Get all roles
   */
  findAll: async (): Promise<Role[]> => {
    try {
      const roles = await db("roles").select(
        "id",
        "name",
        "description",
        "created_at as createdAt",
        "updated_at as updatedAt",
      );

      return roles;
    } catch (error) {
      console.error("Error finding all roles:", error);
      throw error;
    }
  },

  /**
   * Create a new role
   */
  create: async (roleData: {
    name: string;
    description?: string;
  }): Promise<Role> => {
    try {
      const [id] = await db("roles").insert({
        name: roleData.name,
        description: roleData.description,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return RoleService.findById(id) as Promise<Role>;
    } catch (error) {
      console.error("Error creating role:", error);
      throw error;
    }
  },

  /**
   * Update role
   */
  update: async (
    id: number,
    roleData: { name?: string; description?: string },
  ): Promise<Role | null> => {
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (roleData.name) updateData.name = roleData.name;
      if (roleData.description !== undefined)
        updateData.description = roleData.description;

      await db("roles").where("id", id).update(updateData);

      return RoleService.findById(id);
    } catch (error) {
      console.error("Error updating role:", error);
      throw error;
    }
  },

  /**
   * Delete role
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await db("roles").where("id", id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting role:", error);
      throw error;
    }
  },

  /**
   * Get role permissions
   */
  getPermissions: async (roleId: number): Promise<Permission[]> => {
    try {
      const permissions = await db("permissions")
        .select(
          "permissions.id",
          "permissions.name",
          "permissions.description",
          "permissions.category",
          "permissions.created_at as createdAt",
          "permissions.updated_at as updatedAt",
        )
        .join(
          "role_permissions",
          "permissions.id",
          "role_permissions.permission_id",
        )
        .where("role_permissions.role_id", roleId);

      return permissions;
    } catch (error) {
      console.error("Error getting role permissions:", error);
      throw error;
    }
  },

  /**
   * Assign permission to role
   */
  assignPermission: async (
    roleId: number,
    permissionId: number,
  ): Promise<boolean> => {
    try {
      // Check if already assigned
      const existing = await db("role_permissions")
        .where({
          role_id: roleId,
          permission_id: permissionId,
        })
        .first();

      if (existing) return true; // Already assigned

      // Assign permission
      await db("role_permissions").insert({
        role_id: roleId,
        permission_id: permissionId,
      });

      return true;
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      throw error;
    }
  },

  /**
   * Remove permission from role
   */
  removePermission: async (
    roleId: number,
    permissionId: number,
  ): Promise<boolean> => {
    try {
      await db("role_permissions")
        .where({
          role_id: roleId,
          permission_id: permissionId,
        })
        .delete();

      return true;
    } catch (error) {
      console.error("Error removing permission from role:", error);
      throw error;
    }
  },

  /**
   * Get users with role
   */
  getUsers: async (
    roleId: number,
  ): Promise<{ id: number; email: string; fullName: string }[]> => {
    try {
      const users = await db("users")
        .select("users.id", "users.email", "users.full_name as fullName")
        .join("user_roles", "users.id", "user_roles.user_id")
        .where("user_roles.role_id", roleId);

      return users;
    } catch (error) {
      console.error("Error getting users with role:", error);
      throw error;
    }
  },

  /**
   * Assign role to user
   */
  assignToUser: async (roleId: number, userId: number): Promise<boolean> => {
    try {
      // Check if already assigned
      const existing = await db("user_roles")
        .where({
          user_id: userId,
          role_id: roleId,
        })
        .first();

      if (existing) return true; // Already assigned

      // Assign role
      await db("user_roles").insert({
        user_id: userId,
        role_id: roleId,
        created_at: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Error assigning role to user:", error);
      throw error;
    }
  },

  /**
   * Remove role from user
   */
  removeFromUser: async (roleId: number, userId: number): Promise<boolean> => {
    try {
      await db("user_roles")
        .where({
          user_id: userId,
          role_id: roleId,
        })
        .delete();

      return true;
    } catch (error) {
      console.error("Error removing role from user:", error);
      throw error;
    }
  },
};
