import pool from "../../lib/db";

export interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateRoleData {
  name: string;
  description?: string;
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
        "SELECT id, name, description, created_at as createdAt, updated_at as updatedAt FROM roles",
      );

      return rows as Role[];
    } catch (error) {
      console.error("Error getting all roles:", error);
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
}
