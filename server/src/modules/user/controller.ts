import { Request, Response } from "express";
import { UserService } from "./service";
import { RoleService } from "../role/service";
import { asyncHandler } from "../../middleware/errorHandler";
import { AppError } from "../../middleware/errorHandler";
import { AuthService } from "../auth/service";

export const UserController = {
  /**
   * Get all users
   */
  getAllUsers: asyncHandler(async (_req: Request, res: Response) => {
    const users = await UserService.findAll();

    // Remove passwords from response
    const sanitizedUsers = users.map((user) => AuthService.sanitizeUser(user));

    res.json(sanitizedUsers);
  }),

  /**
   * Get user by ID
   */
  getUserById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await UserService.findById(parseInt(id));

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(AuthService.sanitizeUser(user));
  }),

  /**
   * Create a new user (admin function)
   */
  createUser: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, fullName, role } = req.body;

    // Check if user already exists
    const existingUser = await UserService.findByEmail(email);
    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    // Create user
    const user = await UserService.create({
      email,
      password,
      fullName,
      role,
    });

    res.status(201).json(AuthService.sanitizeUser(user));
  }),

  /**
   * Update user
   */
  updateUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { email, fullName, password } = req.body;

    const user = await UserService.update(parseInt(id), {
      email,
      fullName,
      password,
    });

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(AuthService.sanitizeUser(user));
  }),

  /**
   * Delete user
   */
  deleteUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = parseInt(id);

    // Check if user exists
    const user = await UserService.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Delete user
    await UserService.delete(userId);

    res.json({ message: "User deleted successfully" });
  }),

  /**
   * Get user roles
   */
  getUserRoles: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await UserService.findById(parseInt(id));

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
    const user = await UserService.findById(parseInt(id));
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if role exists
    const role = await RoleService.findById(roleId);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Assign role to user
    await RoleService.assignToUser(roleId, parseInt(id));

    // Get updated user with roles
    const updatedUser = await UserService.findById(parseInt(id));

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
    const user = await UserService.findById(parseInt(id));
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if role exists
    const role = await RoleService.findById(parseInt(roleId));
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Remove role from user
    await RoleService.removeFromUser(parseInt(roleId), parseInt(id));

    // Get updated user with roles
    const updatedUser = await UserService.findById(parseInt(id));

    res.json({
      message: "Role removed successfully",
      roles: updatedUser?.roles || [],
    });
  }),
};
