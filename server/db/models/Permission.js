import pool from "../../lib/db.js";

export class PermissionModel {
  /**
   * Find permission by ID
   */
  static async findById(id) {
    try {
      const [permissions] = await pool.execute(
        "SELECT id, name, description FROM permissions WHERE id = ?",
        [id],
      );

      if (permissions.length === 0) return null;
      return permissions[0];
    } catch (error) {
      console.error("Error finding permission by ID:", error);
      throw error;
    }
  }

  /**
   * Find permission by name
   */
  static async findByName(name) {
    try {
      const [permissions] = await pool.execute(
        "SELECT id, name, description FROM permissions WHERE name = ?",
        [name],
      );

      if (permissions.length === 0) return null;
      return permissions[0];
    } catch (error) {
      console.error("Error finding permission by name:", error);
      throw error;
    }
  }

  /**
   * Get all permissions
   */
  static async findAll() {
    try {
      const [permissions] = await pool.execute(
        "SELECT id, name, description FROM permissions",
      );
      return permissions;
    } catch (error) {
      console.error("Error finding all permissions:", error);
      throw error;
    }
  }

  /**
   * Check if user has permission
   */
  static async userHasPermission(userId, permissionName) {
    try {
      const [rows] = await pool.execute(
        `SELECT 1 FROM permissions p 
         JOIN role_permissions rp ON p.id = rp.permission_id 
         JOIN user_roles ur ON rp.role_id = ur.role_id 
         WHERE ur.user_id = ? AND p.name = ?`,
        [userId, permissionName],
      );
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking if user has permission:", error);
      return false;
    }
  }
}
