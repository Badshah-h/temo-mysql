import pool from "../../lib/db.js";

export class RoleModel {
  /**
   * Find role by ID
   */
  static async findById(id) {
    try {
      const [roles] = await pool.execute(
        "SELECT id, name, description FROM roles WHERE id = ?",
        [id],
      );

      if (roles.length === 0) return null;
      return roles[0];
    } catch (error) {
      console.error("Error finding role by ID:", error);
      throw error;
    }
  }

  /**
   * Find role by name
   */
  static async findByName(name) {
    try {
      const [roles] = await pool.execute(
        "SELECT id, name, description FROM roles WHERE name = ?",
        [name],
      );

      if (roles.length === 0) return null;
      return roles[0];
    } catch (error) {
      console.error("Error finding role by name:", error);
      throw error;
    }
  }

  /**
   * Get all roles
   */
  static async findAll() {
    try {
      const [roles] = await pool.execute(
        "SELECT id, name, description FROM roles",
      );
      return roles;
    } catch (error) {
      console.error("Error finding all roles:", error);
      throw error;
    }
  }

  /**
   * Get role permissions
   */
  static async getRolePermissions(roleId) {
    try {
      const [permissions] = await pool.execute(
        `SELECT p.id, p.name, p.description 
         FROM permissions p 
         JOIN role_permissions rp ON p.id = rp.permission_id 
         WHERE rp.role_id = ?`,
        [roleId],
      );
      return permissions;
    } catch (error) {
      console.error("Error getting role permissions:", error);
      throw error;
    }
  }

  /**
   * Assign permission to role
   */
  static async assignPermission(roleId, permissionId) {
    try {
      // Check if already assigned
      const [existing] = await pool.execute(
        "SELECT 1 FROM role_permissions WHERE role_id = ? AND permission_id = ?",
        [roleId, permissionId],
      );

      if (existing.length > 0) return true; // Already assigned

      // Assign permission
      await pool.execute(
        "INSERT INTO role_permissions (role_id, permission_id) VALUES (?, ?)",
        [roleId, permissionId],
      );

      return true;
    } catch (error) {
      console.error("Error assigning permission to role:", error);
      throw error;
    }
  }

  /**
   * Remove permission from role
   */
  static async removePermission(roleId, permissionId) {
    try {
      await pool.execute(
        "DELETE FROM role_permissions WHERE role_id = ? AND permission_id = ?",
        [roleId, permissionId],
      );
      return true;
    } catch (error) {
      console.error("Error removing permission from role:", error);
      throw error;
    }
  }

  /**
   * Get users with role
   */
  static async getUsersWithRole(roleId) {
    try {
      const [users] = await pool.execute(
        `SELECT u.id, u.email, u.full_name as fullName 
         FROM users u 
         JOIN user_roles ur ON u.id = ur.user_id 
         WHERE ur.role_id = ?`,
        [roleId],
      );
      return users;
    } catch (error) {
      console.error("Error getting users with role:", error);
      throw error;
    }
  }
}
