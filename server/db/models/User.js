import pool from "../../lib/db.js";
import bcrypt from "bcryptjs";

export class UserModel {
  /**
   * Find user by ID with roles and permissions
   */
  static async findByIdWithRolesAndPermissions(id) {
    try {
      // Get user
      const [users] = await pool.execute(
        "SELECT id, email, full_name as fullName, created_at, updated_at FROM users WHERE id = ?",
        [id],
      );

      if (users.length === 0) return null;
      const user = users[0];

      // Get user roles
      const [roles] = await pool.execute(
        `SELECT r.id, r.name, r.description 
         FROM roles r 
         JOIN user_roles ur ON r.id = ur.role_id 
         WHERE ur.user_id = ?`,
        [id],
      );

      // Get user permissions through roles
      const [permissions] = await pool.execute(
        `SELECT DISTINCT p.id, p.name, p.description 
         FROM permissions p 
         JOIN role_permissions rp ON p.id = rp.permission_id 
         JOIN user_roles ur ON rp.role_id = ur.role_id 
         WHERE ur.user_id = ?`,
        [id],
      );

      // Return user with roles and permissions
      return {
        ...user,
        roles,
        permissions,
        role: roles.length > 0 ? roles[0].name : "user", // Primary role for backward compatibility
      };
    } catch (error) {
      console.error("Error finding user by ID with roles:", error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email) {
    try {
      const [users] = await pool.execute(
        "SELECT id, email, full_name as fullName, created_at, updated_at FROM users WHERE email = ?",
        [email],
      );

      if (users.length === 0) return null;
      return users[0];
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  static async create({ email, password, fullName, role = "user" }) {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Begin transaction
      const connection = await pool.getConnection();
      await connection.beginTransaction();

      try {
        // Create user
        const [result] = await connection.execute(
          "INSERT INTO users (email, password, full_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
          [email, hashedPassword, fullName],
        );

        const userId = result.insertId;

        // Get role ID
        const [roles] = await connection.execute(
          "SELECT id FROM roles WHERE name = ?",
          [role],
        );

        let roleId;
        if (roles.length > 0) {
          roleId = roles[0].id;
        } else {
          // If specified role doesn't exist, use default user role
          const [defaultRoles] = await connection.execute(
            "SELECT id FROM roles WHERE name = 'user'",
          );
          roleId = defaultRoles.length > 0 ? defaultRoles[0].id : null;
        }

        // Assign role to user
        if (roleId) {
          await connection.execute(
            "INSERT INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())",
            [userId, roleId],
          );
        }

        // Commit transaction
        await connection.commit();
        connection.release();

        // Return created user
        return {
          id: userId,
          email,
          fullName,
          role,
        };
      } catch (error) {
        // Rollback transaction on error
        await connection.rollback();
        connection.release();
        throw error;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(userId) {
    try {
      await pool.execute("UPDATE users SET last_login = NOW() WHERE id = ?", [
        userId,
      ]);
      return true;
    } catch (error) {
      console.error("Error updating last login:", error);
      return false;
    }
  }

  /**
   * Check if user has role
   */
  static async hasRole(userId, roleName) {
    try {
      const [rows] = await pool.execute(
        `SELECT 1 FROM user_roles ur 
         JOIN roles r ON ur.role_id = r.id 
         WHERE ur.user_id = ? AND r.name = ?`,
        [userId, roleName],
      );
      return rows.length > 0;
    } catch (error) {
      console.error("Error checking if user has role:", error);
      return false;
    }
  }

  /**
   * Check if user has permission
   */
  static async hasPermission(userId, permissionName) {
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

  /**
   * Get all users with roles
   */
  static async findAll() {
    try {
      const [users] = await pool.execute(
        "SELECT id, email, full_name as fullName, created_at, updated_at FROM users",
      );

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const [roles] = await pool.execute(
            `SELECT r.id, r.name, r.description 
             FROM roles r 
             JOIN user_roles ur ON r.id = ur.role_id 
             WHERE ur.user_id = ?`,
            [user.id],
          );

          return {
            ...user,
            roles,
            role: roles.length > 0 ? roles[0].name : "user",
          };
        }),
      );

      return usersWithRoles;
    } catch (error) {
      console.error("Error finding all users:", error);
      throw error;
    }
  }
}
