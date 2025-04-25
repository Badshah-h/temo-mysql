import pool from "../../lib/db";
import { hashPassword } from "../../lib/auth";

export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
  isActive?: boolean;
}

export interface CreateUserData {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface UpdateUserData {
  email?: string;
  fullName?: string;
  role?: string;
  isActive?: boolean;
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

      if (fields.length === 0) {
        return this.findById(id);
      }

      values.push(id);

      await pool.execute(
        `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );

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
  ): Promise<{ users: User[]; total: number }> {
    try {
      const offset = (page - 1) * limit;

      const [rows] = await pool.execute(
        "SELECT id, email, full_name as fullName, role, created_at as createdAt, updated_at as updatedAt, last_login as lastLogin, is_active as isActive FROM users LIMIT ? OFFSET ?",
        [limit, offset],
      );

      const [countResult] = await pool.execute(
        "SELECT COUNT(*) as total FROM users",
      );
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
}
