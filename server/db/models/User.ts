import pool from "../../lib/db";
import { hashPassword } from "../../lib/auth.js";
import { Role, RoleModel } from "./Role";
import { Permission, PermissionModel } from "./Permission";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  isActive?: boolean;
  roles?: Role[];
  permissions?: Permission[];
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
  roleIds?: number[];
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
  roleIds?: number[];
}

export class UserModel {
  /**
   * Find user by ID
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const [rows] = await pool.execute(
        "SELECT id, email, full_name as fullName, role, created_at as createdAt, updated_at as updatedAt, last_login as lastLogin, is_active as isActive FROM users WHERE id = ?",
        [id],
      );

      const users = rows as User[];

      if (users.length === 0) {
        return null;
      }

      return users[0];
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  /**
   * Find user by ID with roles and permissions
   */
  static async findByIdWithRolesAndPermissions(
    id: number,
  ): Promise<User | null> {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      // Get user roles
      user.roles = await RoleModel.getUserRoles(id);

      // Get user permissions
      user.permissions = await PermissionModel.getPermissionsForUser(id);

      return user;
    } catch (error) {
      console.error("Error finding user with roles and permissions:", error);
      return null;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const [rows] = await pool.execute(
        "SELECT id, email, full_name as fullName, role, created_at as createdAt, updated_at as updatedAt, last_login as lastLogin, is_active as isActive FROM users WHERE email = ?",
        [email],
      );

      const users = rows as User[];

      if (users.length === 0) {
        return null;
      }

      return users[0];
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  /**
   * Create a new user
   */
  static async create(userData: CreateUserData): Promise<User | null> {
    try {
      const hashedPassword = await hashPassword(userData.password);

      const [result] = await pool.execute(
        "INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)",
        [
          userData.email,
          hashedPassword,
          userData.fullName,
          userData.role || "user",
        ],
      );

      const insertId = (result as any).insertId;

      if (insertId) {
        // If roleIds are provided, assign them to the user
        if (userData.roleIds && userData.roleIds.length > 0) {
          for (const roleId of userData.roleIds) {
            await RoleModel.assignRoleToUser(insertId, roleId);
          }
        } else {
          // Assign default user role if no roles specified
          const userRole = await RoleModel.findByName("user");
          if (userRole) {
            await RoleModel.assignRoleToUser(insertId, userRole.id);
          }
        }

        return this.findById(insertId);
      }

      return null;
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  }

  /**
   * Update a user
   */
  static async update(
    id: number,
    userData: UpdateUserData,
  ): Promise<User | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (userData.email) {
        fields.push("email = ?");
        values.push(userData.email);
      }

      if (userData.fullName) {
        fields.push("full_name = ?");
        values.push(userData.fullName);
      }

      if (userData.role) {
        fields.push("role = ?");
        values.push(userData.role);
      }

      if (userData.isActive !== undefined) {
        fields.push("is_active = ?");
        values.push(userData.isActive);
      }

      if (fields.length > 0) {
        values.push(id);
        await pool.execute(
          `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
          values,
        );
      }

      // Update user roles if provided
      if (userData.roleIds !== undefined) {
        // First remove all existing roles
        await pool.execute("DELETE FROM user_roles WHERE user_id = ?", [id]);

        // Then assign new roles
        if (userData.roleIds.length > 0) {
          for (const roleId of userData.roleIds) {
            await RoleModel.assignRoleToUser(id, roleId);
          }
        }
      }

      return this.findById(id);
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(id: number, password: string): Promise<boolean> {
    try {
      const hashedPassword = await hashPassword(password);

      await pool.execute("UPDATE users SET password = ? WHERE id = ?", [
        hashedPassword,
        id,
      ]);

      return true;
    } catch (error) {
      console.error("Error updating user password:", error);
      return false;
    }
  }

  /**
   * Delete a user
   */
  static async delete(id: number): Promise<boolean> {
    try {
      // User roles will be automatically deleted due to CASCADE constraint
      await pool.execute("DELETE FROM users WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  /**
   * Get all users with pagination
   */
  static async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    sortBy: string = "fullName",
    sortOrder: "asc" | "desc" = "asc",
  ): Promise<{ users: User[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const values: any[] = [];

      // Base query
      let query =
        "SELECT id, email, full_name as fullName, role, created_at as createdAt, updated_at as updatedAt, last_login as lastLogin, is_active as isActive FROM users";

      // Add search condition if provided
      if (search) {
        query += " WHERE (email LIKE ? OR full_name LIKE ?)";
        values.push(`%${search}%`, `%${search}%`);
      }

      // Add sorting
      const sortColumn =
        sortBy === "fullName"
          ? "full_name"
          : sortBy === "email"
            ? "email"
            : sortBy === "role"
              ? "role"
              : sortBy === "lastLogin"
                ? "last_login"
                : sortBy === "createdAt"
                  ? "created_at"
                  : "full_name";

      query += ` ORDER BY ${sortColumn} ${sortOrder === "desc" ? "DESC" : "ASC"}`;

      // Add pagination
      query += " LIMIT ? OFFSET ?";
      values.push(limit, offset);

      const [rows] = await pool.execute(query, values);

      // Count query
      let countQuery = "SELECT COUNT(*) as total FROM users";
      const countValues: any[] = [];

      if (search) {
        countQuery += " WHERE (email LIKE ? OR full_name LIKE ?)";
        countValues.push(`%${search}%`, `%${search}%`);
      }

      const [countResult] = await pool.execute(countQuery, countValues);
      const total = (countResult as any[])[0].total;

      return {
        users: rows as User[],
        total,
      };
    } catch (error) {
      console.error("Error getting all users:", error);
      return { users: [], total: 0 };
    }
  }

  /**
   * Update last login timestamp
   */
  static async updateLastLogin(id: number): Promise<boolean> {
    try {
      await pool.execute(
        "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
        [id],
      );

      return true;
    } catch (error) {
      console.error("Error updating last login:", error);
      return false;
    }
  }

  /**
   * Check if user has permission
   */
  static async hasPermission(
    userId: number,
    permissionName: string,
  ): Promise<boolean> {
    return PermissionModel.userHasPermission(userId, permissionName);
  }

  /**
   * Get user permissions
   */
  static async getUserPermissions(userId: number): Promise<Permission[]> {
    return PermissionModel.getPermissionsForUser(userId);
  }

  /**
   * Get user roles with permissions
   */
  static async getUserRolesWithPermissions(userId: number): Promise<Role[]> {
    try {
      const roles = await RoleModel.getUserRoles(userId);

      // Get permissions for each role
      for (const role of roles) {
        role.permissions = await PermissionModel.getPermissionsForRole(role.id);
      }

      return roles;
    } catch (error) {
      console.error("Error getting user roles with permissions:", error);
      return [];
    }
  }
}
