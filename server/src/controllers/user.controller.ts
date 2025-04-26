import { Request, Response } from "express";
import { UserModel } from "../models/User";
import { RoleModel } from "../models/Role";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";

export const UserController = {
  /**
   * Get all users
   */
  getAllUsers: asyncHandler(async (req: Request, res: Response) => {
    const users = await UserModel.findAll();

    // Remove passwords from response
    const sanitizedUsers = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json(sanitizedUsers);
  }),

  /**
   * Get user by ID
   */
  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await UserModel.findById(parseInt(id));

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Remove password from response
    delete user.password;

    res.json(user);
  }),

  /**
   * Create a new user (admin function)
   */
  createUser: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, fullName, role } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      throw new AppError("Email, password, and full name are required", 400);
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    // Create user
    const user = await UserModel.create({
      email,
      password,
      fullName,
      role,
    });

    // Remove password from response
    delete user.password;

    res.status(201).json(user);
  }),

  /**
   * Update user
   */
  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, fullName, password } = req.body;

    const user = await UserModel.update(parseInt(id), {
      email,
      fullName,
      password,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Remove password from response
    delete user.password;

    res.json(user);
  }),

  /**
   * Delete user
   */
  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Delete user
    await UserModel.delete(userId);

    res.json({ message: "User deleted successfully" });
  }),

  /**
   * Get user roles
   */
  getUserRoles: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await UserModel.findById(parseInt(id));

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(user.roles || []);
  }),

  /**
   * Assign role to user
   */
  assignRole: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { roleId } = req.body;

    if (!roleId) {
      throw new AppError("Role ID is required", 400);
    }

    // Check if user exists
    const user = await UserModel.findById(parseInt(id));
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if role exists
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Assign role to user
    await RoleModel.assignToUser(roleId, parseInt(id));

    // Get updated user with roles
    const updatedUser = await UserModel.findById(parseInt(id));

    res.json({
      message: "Role assigned successfully",
      roles: updatedUser?.roles || [],
    });
  }),

  /**
   * Remove role from user
   */
  removeRole: asyncHandler(async (req: Request, res: Response) => {
    const { id, roleId } = req.params;

    // Check if user exists
    const user = await UserModel.findById(parseInt(id));
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if role exists
    const role = await RoleModel.findById(parseInt(roleId));
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Remove role from user
    await RoleModel.removeFromUser(parseInt(roleId), parseInt(id));

    // Get updated user with roles
    const updatedUser = await UserModel.findById(parseInt(id));

    res.json({
      message: "Role removed successfully",
      roles: updatedUser?.roles || [],
    });
  }),
};
