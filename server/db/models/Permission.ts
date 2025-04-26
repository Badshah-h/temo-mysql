import pool from "../../lib/db";

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreatePermissionData {
  name: string;
  description?: string;
  category?: string;
}

export class PermissionModel {
  /**
   * Find permission by ID
   */
  static async findById(id: number): Promise<Permission | null> {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, description, category, created_at as createdAt, updated_at as updatedAt FROM permissions WHERE id = ?",
        [id],
      );

      const permissions = rows as Permission[];

      if (permissions.length === 0) {
        return null;
      }

      return permissions[0];
    } catch (error) {
      console.error("Error finding permission by ID:", error);
      return null;
    }
  }

  /**
   * Find permission by name
   */
  static async findByName(name: string): Promise<Permission | null> {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, description, category, created_at as createdAt, updated_at as updatedAt FROM permissions WHERE name = ?",
        [name],
      );

      const permissions = rows as Permission[];

      if (permissions.length === 0) {
        return null;
      }

      return permissions[0];
    } catch (error) {
      console.error("Error finding permission by name:", error);
      return null;
    }
  }

  /**
   * Create a new permission
   */
  static async create(
    permissionData: CreatePermissionData,
  ): Promise<Permission | null> {
    try {
      const [result] = await pool.execute(
        "INSERT INTO permissions (name, description, category) VALUES (?, ?, ?)",
        [
          permissionData.name,
          permissionData.description || null,
          permissionData.category || null,
        ],
      );

      const insertId = (result as any).insertId;

      if (insertId) {
        return this.findById(insertId);
      }

      return null;
    } catch (error) {
      console.error("Error creating permission:", error);
      return null;
    }
  }

  /**
   * Update a permission
   */
  static async update(
    id: number,
    permissionData: CreatePermissionData,
  ): Promise<Permission | null> {
    try {
      await pool.execute(
        "UPDATE permissions SET name = ?, description = ?, category = ? WHERE id = ?",
        [
          permissionData.name,
          permissionData.description || null,
          permissionData.category || null,
          id,
        ],
      );

      return this.findById(id);
    } catch (error) {
      console.error("Error updating permission:", error);
      return null;
    }
  }

  /**
   * Delete a permission
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await pool.execute("DELETE FROM permissions WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.error("Error deleting permission:", error);
      return false;
    }
  }

  /**
   * Get all permissions
   */
  static async getAll(): Promise<Permission[]> {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, description, category, created_at as createdAt, updated_at as updatedAt FROM permissions ORDER BY category, name",
      );

      return rows as Permission[];
    } catch (error) {
      console.error("Error getting all permissions:", error);
      return [];
    }
  }

  /**
   * Get permissions by category
   */
  static async getByCategory(category: string): Promise<Permission[]> {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, description, category, created_at as createdAt, updated_at as updatedAt FROM permissions WHERE category = ? ORDER BY name",
        [category],
      );

      return rows as Permission[];
    } catch (error) {
      console.error("Error getting permissions by category:", error);
      return [];
    }
  }

  /**
   * Get all categories
   */
  static async getAllCategories(): Promise<string[]> {
    try {
      const [rows] = await pool.execute(
        "SELECT DISTINCT category FROM permissions WHERE category IS NOT NULL ORDER BY category",
      );

      return (rows as any[]).map((row) => row.category);
    } catch (error) {
      console.error("Error getting all categories:", error);
      return [];
    }
  }

  /**
   * Get permissions for a role
   */
  static async getPermissionsForRole(roleId: number): Promise<Permission[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT p.id, p.name, p.description, p.category, p.created_at as createdAt, p.updated_at as updatedAt 
         FROM permissions p 
         JOIN role_permissions rp ON p.id = rp.permission_id 
         WHERE rp.role_id = ? 
         ORDER BY p.category, p.name`,
        [roleId],
      );

      return rows as Permission[];
    } catch (error) {
      console.error("Error getting permissions for role:", error);
      return [];
    }
  }

  /**
   * Check if a role has a specific permission
   */
  static async roleHasPermission(
    roleId: number,
    permissionName: string,
  ): Promise<boolean> {
    try {
      const [rows] = await pool.execute(
        `SELECT 1 
         FROM role_permissions rp 
         JOIN permissions p ON rp.permission_id = p.id 
         WHERE rp.role_id = ? AND p.name = ?`,
        [roleId, permissionName],
      );

      return (rows as any[]).length > 0;
    } catch (error) {
      console.error("Error checking if role has permission:", error);
      return false;
    }
  }

  /**
   * Get permissions for a user (via their roles)
   */
  static async getPermissionsForUser(userId: number): Promise<Permission[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT DISTINCT p.id, p.name, p.description, p.category, p.created_at as createdAt, p.updated_at as updatedAt 
         FROM permissions p 
         JOIN role_permissions rp ON p.id = rp.permission_id 
         JOIN user_roles ur ON rp.role_id = ur.role_id 
         WHERE ur.user_id = ? 
         ORDER BY p.category, p.name`,
        [userId],
      );

      return rows as Permission[];
    } catch (error) {
      console.error("Error getting permissions for user:", error);
      return [];
    }
  }

  /**
   * Check if a user has a specific permission
   */
  static async userHasPermission(
    userId: number,
    permissionName: string,
  ): Promise<boolean> {
    try {
      const [rows] = await pool.execute(
        `SELECT 1 
         FROM role_permissions rp 
         JOIN permissions p ON rp.permission_id = p.id 
         JOIN user_roles ur ON rp.role_id = ur.role_id 
         WHERE ur.user_id = ? AND p.name = ?`,
        [userId, permissionName],
      );

      return (rows as any[]).length > 0;
    } catch (error) {
      console.error("Error checking if user has permission:", error);
      return false;
    }
  }
}
