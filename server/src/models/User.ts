import { db } from "../db";
import bcrypt from "bcrypt";
import { User, Role, Permission } from "../types";

export class UserModel {
  /**
   * Find user by ID with roles and permissions
   */
  static async findById(id: number): Promise<User | null> {
    try {
      const user = await db("users")
        .where("id", id)
        .select(
          "id",
          "email",
          "full_name as fullName",
          "last_login as lastLogin",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      if (!user) return null;

      // Get user roles
      const roles = await db("roles")
        .select(
          "roles.id",
          "roles.name",
          "roles.description",
          "roles.created_at as createdAt",
          "roles.updated_at as updatedAt",
        )
        .join("user_roles", "roles.id", "user_roles.role_id")
        .where("user_roles.user_id", id);

      // Get user permissions through roles
      const permissions = await db("permissions")
        .distinct(
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
        .join("user_roles", "role_permissions.role_id", "user_roles.role_id")
        .where("user_roles.user_id", id);

      return {
        ...user,
        roles,
        permissions,
        role: roles.length > 0 ? roles[0].name : "user", // Primary role for backward compatibility
      };
    } catch (error) {
      console.error("Error finding user by ID:", error);
      throw error;
    }
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    try {
      const user = await db("users")
        .where("email", email)
        .select(
          "id",
          "email",
          "password",
          "full_name as fullName",
          "last_login as lastLogin",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      if (!user) return null;

      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      throw error;
    }
  }

  /**
   * Find user by email with roles and permissions
   */
  static async findByEmailWithRoles(email: string): Promise<User | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user) return null;

      // Get user roles
      const roles = await db("roles")
        .select(
          "roles.id",
          "roles.name",
          "roles.description",
          "roles.created_at as createdAt",
          "roles.updated_at as updatedAt",
        )
        .join("user_roles", "roles.id", "user_roles.role_id")
        .where("user_roles.user_id", user.id);

      // Get user permissions through roles
      const permissions = await db("permissions")
        .distinct(
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
        .join("user_roles", "role_permissions.role_id", "user_roles.role_id")
        .where("user_roles.user_id", user.id);

      return {
        ...user,
        roles,
        permissions,
        role: roles.length > 0 ? roles[0].name : "user", // Primary role for backward compatibility
      };
    } catch (error) {
      console.error("Error finding user by email with roles:", error);
      throw error;
    }
  }

  /**
   * Create a new user
   */
  static async create(userData: {
    email: string;
    password: string;
    fullName: string;
    role?: string;
  }): Promise<User> {
    const trx = await db.transaction();

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Create user
      const [userId] = await trx("users").insert({
        email: userData.email,
        password: hashedPassword,
        full_name: userData.fullName,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Get or create role
      const roleName = userData.role || "user"; // Default to 'user' if not specified
      const role = await trx("roles").where("name", roleName).first();

      if (role) {
        // Assign role to user
        await trx("user_roles").insert({
          user_id: userId,
          role_id: role.id,
          created_at: new Date(),
        });
      } else {
        // If specified role doesn't exist, use default user role
        const defaultRole = await trx("roles").where("name", "user").first();
        if (defaultRole) {
          await trx("user_roles").insert({
            user_id: userId,
            role_id: defaultRole.id,
            created_at: new Date(),
          });
        }
      }

      // Commit transaction
      await trx.commit();

      // Return created user
      return this.findById(userId) as Promise<User>;
    } catch (error) {
      // Rollback transaction on error
      await trx.rollback();
      console.error("Error creating user:", error);
      throw error;
    }
  }

  /**
   * Update user
   */
  static async update(
    id: number,
    userData: {
      email?: string;
      fullName?: string;
      password?: string;
    },
  ): Promise<User | null> {
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (userData.email) updateData.email = userData.email;
      if (userData.fullName) updateData.full_name = userData.fullName;
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 10);
      }

      await db("users").where("id", id).update(updateData);

      return this.findById(id);
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  /**
   * Update user's last login timestamp
   */
  static async updateLastLogin(id: number): Promise<boolean> {
    try {
      await db("users").where("id", id).update({
        last_login: new Date(),
        updated_at: new Date(),
      });
      return true;
    } catch (error) {
      console.error("Error updating last login:", error);
      return false;
    }
  }

  /**
   * Check if user has role
   */
  static async hasRole(userId: number, roleName: string): Promise<boolean> {
    try {
      const result = await db("user_roles")
        .join("roles", "user_roles.role_id", "roles.id")
        .where({
          "user_roles.user_id": userId,
          "roles.name": roleName,
        })
        .first();

      return !!result;
    } catch (error) {
      console.error("Error checking if user has role:", error);
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
  }

  /**
   * Get all users with their roles
   */
  static async findAll(): Promise<User[]> {
    try {
      const users = await db("users").select(
        "id",
        "email",
        "full_name as fullName",
        "last_login as lastLogin",
        "created_at as createdAt",
        "updated_at as updatedAt",
      );

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const roles = await db("roles")
            .select(
              "roles.id",
              "roles.name",
              "roles.description",
              "roles.created_at as createdAt",
              "roles.updated_at as updatedAt",
            )
            .join("user_roles", "roles.id", "user_roles.role_id")
            .where("user_roles.user_id", user.id);

          return {
            ...user,
            roles,
            role: roles.length > 0 ? roles[0].name : "user", // Default role
          };
        }),
      );

      return usersWithRoles;
    } catch (error) {
      console.error("Error getting all users:", error);
      throw error;
    }
  }

  /**
   * Compare password with stored hash
   */
  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Delete user
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db("users").where("id", id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }
}
