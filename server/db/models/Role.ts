import pool from "../../lib/db";
import { Permission } from "./Permission";

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  permissions?: Permission[];
}

export interface CreateRoleData {
  name: string;
  description?: string;
  permissions?: number[];
}

export class RoleModel {
  /**
   * Find role by ID
   */
  static async findById(id: number): Promise<Role | null> {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, description, created_at as createdAt, updated_at as updatedAt FROM roles WHERE id = ?",
        [id],
      );

      const roles = rows as Role[];

      if (roles.length === 0) {
        return null;
      }

      return roles[0];
    } catch (error) {
      console.error("Error finding role by ID:", error);
      return null;
    }
  }

  /**
   * Find role by ID with permissions
   */
  static async findByIdWithPermissions(id: number): Promise<Role | null> {
    try {
      const role = await this.findById(id);
      if (!role) return null;

      const [rows] = await pool.execute(
        `SELECT p.id, p.name, p.description, p.category, p.created_at as createdAt, p.updated_at as updatedAt 
         FROM permissions p 
         JOIN role_permissions rp ON p.id = rp.permission_id 
         WHERE rp.role_id = ? 
         ORDER BY p.category, p.name`,
        [id],
      );

      role.permissions = rows as Permission[];
      return role;
    } catch (error) {
      console.error("Error finding role with permissions:", error);
      return null;
    }
  }

  /**
   * Find role by name
   */
  static async findByName(name: string): Promise<Role | null> {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, description, created_at as createdAt, updated_at as updatedAt FROM roles WHERE name = ?",
        [name],
      );

      const roles = rows as Role[];

      if (roles.length === 0) {
        return null;
      }

      return roles[0];
    } catch (error) {
      console.error("Error finding role by name:", error);
      return null;
    }
  }

  /**
   * Create a new role
   */
  static async create(roleData: CreateRoleData): Promise<Role | null> {
    try {
      const [result] = await pool.execute(
        "INSERT INTO roles (name, description) VALUES (?, ?)",
        [roleData.name, roleData.description || null],
      );

      const insertId = (result as any).insertId;

      if (insertId) {
        // If permissions are provided, assign them to the role
        if (roleData.permissions && roleData.permissions.length > 0) {
          await this.assignPermissionsToRole(insertId, roleData.permissions);
        }
        return this.findById(insertId);
      }

      return null;
    } catch (error) {
      console.error("Error creating role:", error);
      return null;
    }
  }

  /**
   * Update a role
   */
  static async update(
    id: number,
    roleData: CreateRoleData,
  ): Promise<Role | null> {
    try {
      await pool.execute(
        "UPDATE roles SET name = ?, description = ? WHERE id = ?",
        [roleData.name, roleData.description || null, id],
      );

      // If permissions are provided, update role permissions
      if (roleData.permissions !== undefined) {
        // First remove all existing permissions
        await pool.execute("DELETE FROM role_permissions WHERE role_id = ?", [
          id,
        ]);

        // Then assign new permissions
        if (roleData.permissions.length > 0) {
          await this.assignPermissionsToRole(id, roleData.permissions);
        }
      }

      return this.findById(id);
    } catch (error) {
      console.error("Error updating role:", error);
      return null;
    }
  }

  /**
   * Delete a role
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // Role permissions will be automatically deleted due to CASCADE constraint
      await pool.execute("DELETE FROM roles WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.error("Error deleting role:", error);
      return false;
    }
  }

  /**
   * Get all roles
   */
  static async getAll(): Promise<Role[]> {
    try {
      const [rows] = await pool.execute(
        "SELECT id, name, description, created_at as createdAt, updated_at as updatedAt FROM roles ORDER BY name",
      );

      return rows as Role[];
    } catch (error) {
      console.error("Error getting all roles:", error);
      return [];
    }
  }

  /**
   * Get all roles with permissions count
   */
  static async getAllWithPermissionCount(): Promise<
    (Role & { permissionCount: number })[]
  > {
    try {
      const [rows] = await pool.execute(
        `SELECT r.id, r.name, r.description, r.created_at as createdAt, r.updated_at as updatedAt,
         COUNT(rp.permission_id) as permissionCount
         FROM roles r
         LEFT JOIN role_permissions rp ON r.id = rp.role_id
         GROUP BY r.id
         ORDER BY r.name`,
      );

      return rows as (Role & { permissionCount: number })[];
    } catch (error) {
      console.error("Error getting all roles with permission count:", error);
      return [];
    }
  }

  /**
   * Assign role to user
   */
  static async assignRoleToUser(
    userId: number,
    roleId: number,
  ): Promise<boolean> {
    try {
      await pool.execute(
        "INSERT INTO user_roles (user_id, role_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE assigned_at = CURRENT_TIMESTAMP",
        [userId, roleId],
      );

      return true;
    } catch (error) {
      console.error("Error assigning role to user:", error);
      return false;
    }
  }

  /**
   * Remove role from user
   */
  static async removeRoleFromUser(
    userId: number,
    roleId: number,
  ): Promise<boolean> {
    try {
      await pool.execute(
        "DELETE FROM user_roles WHERE user_id = ? AND role_id = ?",
        [userId, roleId],
      );

      return true;
    } catch (error) {
      console.error("Error removing role from user:", error);
      return false;
    }
  }

  /**
   * Get user roles
   */
  static async getUserRoles(userId: number): Promise<Role[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT r.id, r.name, r.description, r.created_at as createdAt, r.updated_at as updatedAt 
         FROM roles r 
         JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = ?`,
        [userId],
      );

      return rows as Role[];
    } catch (error) {
      console.error("Error getting user roles:", error);
      return [];
    }
  }

  /**
   * Assign permissions to role
   */
  static async assignPermissionsToRole(
    roleId: number,
    permissionIds: number[],
    grantedBy?: number,
  ): Promise<boolean> {
    try {
      // Prepare batch insert values
      const values = permissionIds.map((permissionId) => {
        return grantedBy
          ? [roleId, permissionId, grantedBy]
          : [roleId, permissionId];
      });

      // Construct the SQL query based on whether grantedBy is provided
      const sql = grantedBy
        ? "INSERT INTO role_permissions (role_id, permission_id, granted_by) VALUES ?"
        : "INSERT INTO role_permissions (role_id, permission_id) VALUES ?";

      await pool.query(sql, [values]);
      return true;
    } catch (error) {
      console.error("Error assigning permissions to role:", error);
      return false;
    }
  }

  /**
   * Remove permission from role
   */
  static async removePermissionFromRole(
    roleId: number,
    permissionId: number,
  ): Promise<boolean> {
    try {
      await pool.execute(
        "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?",
        [roleId, permissionId],
      );

      return true;
    } catch (error) {
      console.error("Error removing permission from role:", error);
      return false;
    }
  }

  /**
   * Get users with a specific role
   */
  static async getUsersWithRole(
    roleId: number,
  ): Promise<{ id: number; email: string; fullName: string }[]> {
    try {
      const [rows] = await pool.execute(
        `SELECT u.id, u.email, u.full_name as fullName
         FROM users u
         JOIN user_roles ur ON u.id = ur.user_id
         WHERE ur.role_id = ?
         ORDER BY u.full_name`,
        [roleId],
      );

      return rows as { id: number; email: string; fullName: string }[];
    } catch (error) {
      console.error("Error getting users with role:", error);
      return [];
    }
  }
}
