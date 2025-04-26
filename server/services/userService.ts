import bcrypt from 'bcrypt';
import { User } from '../db/models/User';
export const userService = {
  /**
   * Get user by ID with roles
   */
  getUserById: async (id: number) => {
    return await UserObjection.query().findById(id).withGraphFetched('roles');
  },

  /**
   * Get user by email with roles
   */
  getUserByEmail: async (email: string) => {
    return await UserObjection.query().findOne({ email }).withGraphFetched('roles');
  },

  /**
   * Create a new user
   */
  createUser: async (userData: {
    email: string;
    password: string;
    full_name: string;
    roleIds?: number[];
  }) => {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await UserObjection.query().insert({
      email: userData.email,
      password: hashedPassword,
      full_name: userData.full_name,
      created_at: new Date(),
      updated_at: new Date(),
    });
    if (userData.roleIds && userData.roleIds.length > 0) {
      await user.$relatedQuery('roles').relate(userData.roleIds);
    }
    return user;
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
  ) => {
    const updateData: any = {
      updated_at: new Date(),
    };
    if (userData.email) updateData.email = userData.email;
    if (userData.full_name) updateData.full_name = userData.full_name;
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }
    await UserObjection.query().findById(id).patch(updateData);
    return await userService.getUserById(id);
  },

  /**
   * Assign role to user
   */
  assignRoleToUser: async (
    userId: number,
    roleId: number,
  ) => {
    const user = await UserObjection.query().findById(userId);
    if (!user) return false;
    await user.$relatedQuery('roles').relate(roleId);
    return true;
  },

  /**
   * Remove role from user
   */
  removeRoleFromUser: async (
    userId: number,
    roleId: number,
  ) => {
    const user = await UserObjection.query().findById(userId);
    if (!user) return false;
    await user.$relatedQuery('roles').unrelate().where('role_id', roleId);
    return true;
  },

  /**
   * Check if user has role
   */
  userHasRole: async (userId: number, roleName: string) => {
    const user = await UserObjection.query().findById(userId).withGraphFetched('roles');
    if (!user || !user.roles) return false;
    return user.roles.some(role => role.name === roleName);
  },

  /**
   * Get all users with their roles
   */
  getAllUsers: async () => {
    return await UserObjection.query().withGraphFetched('roles');
  },
};
