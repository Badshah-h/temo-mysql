import { db } from "../lib/db";
import bcrypt from "bcrypt";
import { User } from "../types/user";

export const userService = {
  /**
   * Get user by ID with roles
   */
  getUserById: async (id: number): Promise<User | null> => {
    try {
      // Get user
      const user = await db("users").where("id", id).first();

      if (!user) return null;

      // Get user roles
      const userRoles = await db("user_roles")
        .select("roles.id", "roles.name", "roles.description")
        .join("roles", "user_roles.role_id", "roles.id")
        .where("user_roles.user_id", id);

      // Return user with roles
      return {
        ...user,
        roles: userRoles,
        role: userRoles.length > 0 ? userRoles[0].name : "user", // Default role
      };
    } catch (error) {
      console.error("Error getting user by ID:", error);
      return null;
    }
  },

  /**
   * Get user by email with roles
   */
  getUserByEmail: async (email: string): Promise<User | null> => {
    try {
      // Get user
      const user = await db("users").where("email", email).first();

      if (!user) return null;

      // Get user roles
      const userRoles = await db("user_roles")
        .select("roles.id", "roles.name", "roles.description")
        .join("roles", "user_roles.role_id", "roles.id")
        .where("user_roles.user_id", user.id);

      // Return user with roles
      return {
        ...user,
        roles: userRoles,
        role: userRoles.length > 0 ? userRoles[0].name : "user", // Default role
      };
    } catch (error) {
      console.error("Error getting user by email:", error);
      return null;
    }
  },

  /**
   * Create a new user
   */
  createUser: async (userData: {
    email: string;
    password: string;
    full_name: string;
    role?: string;
  }): Promise<User | null> => {
    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 10);

      // Begin transaction
      const trx = await db.transaction();

      try {
        // Create user
        const [userId] = await trx("users").insert({
          email: userData.email,
          password: hashedPassword,
          full_name: userData.full_name,
          created_at: new Date(),
          updated_at: new Date(),
        });

        // Get or create role
        let roleId;
        const roleName = userData.role || "user"; // Default to 'user' if not specified

        const existingRole = await trx("roles").where("name", roleName).first();

        if (existingRole) {
          roleId = existingRole.id;
        } else {
          // If role doesn't exist, use the default user role
          const defaultRole = await trx("roles").where("name", "user").first();
          roleId = defaultRole ? defaultRole.id : null;
        }

        // Assign role to user if role exists
        if (roleId) {
          await trx("user_roles").insert({
            user_id: userId,
            role_id: roleId,
            created_at: new Date(),
          });
        }

        // Commit transaction
        await trx.commit();

        // Return created user
        return await userService.getUserById(userId);
      } catch (error) {
        // Rollback transaction on error
        await trx.rollback();
        throw error;
      }
    } catch (error) {
      console.error("Error creating user:", error);
      return null;
    }
  },

  /**
   * Update user
   */
  updateUser: async (
    id: number,
    userData: {
      email?: string;
      full_name?: string;
      password?: string;
    },
  ): Promise<User | null> => {
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (userData.email) updateData.email = userData.email;
      if (userData.full_name) updateData.full_name = userData.full_name;
      if (userData.password) {
        updateData.password = await bcrypt.hash(userData.password, 10);
      }

      await db("users").where("id", id).update(updateData);

      return await userService.getUserById(id);
    } catch (error) {
      console.error("Error updating user:", error);
      return null;
    }
  },

  /**
   * Assign role to user
   */
  assignRoleToUser: async (
    userId: number,
    roleId: number,
  ): Promise<boolean> => {
    try {
      // Check if user already has this role
      const existingRole = await db("user_roles")
        .where({
          user_id: userId,
          role_id: roleId,
        })
        .first();

      if (existingRole) return true; // Role already assigned

      // Assign role
      await db("user_roles").insert({
        user_id: userId,
        role_id: roleId,
        created_at: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Error assigning role to user:", error);
      return false;
    }
  },

  /**
   * Remove role from user
   */
  removeRoleFromUser: async (
    userId: number,
    roleId: number,
  ): Promise<boolean> => {
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
      return false;
    }
  },

  /**
   * Check if user has role
   */
  userHasRole: async (userId: number, roleName: string): Promise<boolean> => {
    try {
      const role = await db("user_roles")
        .select("roles.name")
        .join("roles", "user_roles.role_id", "roles.id")
        .where({
          "user_roles.user_id": userId,
          "roles.name": roleName,
        })
        .first();

      return !!role;
    } catch (error) {
      console.error("Error checking if user has role:", error);
      return false;
    }
  },

  /**
   * Get all users with their roles
   */
  getAllUsers: async (): Promise<User[]> => {
    try {
      const users = await db("users").select("*");

      // Get roles for each user
      const usersWithRoles = await Promise.all(
        users.map(async (user) => {
          const userRoles = await db("user_roles")
            .select("roles.id", "roles.name", "roles.description")
            .join("roles", "user_roles.role_id", "roles.id")
            .where("user_roles.user_id", user.id);

          return {
            ...user,
            roles: userRoles,
            role: userRoles.length > 0 ? userRoles[0].name : "user", // Default role
          };
        }),
      );

      return usersWithRoles;
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  },
};
