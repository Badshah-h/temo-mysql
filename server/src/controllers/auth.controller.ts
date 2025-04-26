import { Request, Response } from "express";
import { UserModel } from "../models/User";
import { RoleModel } from "../models/Role";
import { comparePasswords, generateToken } from "../utils/auth";
import { asyncHandler } from "../middleware/errorHandler";

export const AuthController = {
  /**
   * Register a new user
   */
  register: asyncHandler(async (req: Request, res: Response) => {
    const { email, password, fullName, role } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res
        .status(400)
        .json({ message: "Email, password, and full name are required" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create user
    const user = await UserModel.create({
      email,
      password,
      fullName,
      role: role || "user",
    });

    // Generate token
    const token = generateToken(user);

    // Return user data and token
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        roles: user.roles,
      },
    });
  }),

  /**
   * Login user
   */
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user
    const user = await UserModel.findByEmailWithRoles(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const validPassword = await comparePasswords(password, user.password!);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Update last login timestamp
    await UserModel.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user);

    // Remove password from response
    delete user.password;

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        roles: user.roles,
      },
    });
  }),

  /**
   * Get current user
   */
  getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove password from response
    delete user.password;

    res.json(user);
  }),

  /**
   * Logout user
   * Note: This is mostly a client-side operation, but we can add server-side logic if needed
   */
  logout: asyncHandler(async (req: Request, res: Response) => {
    // In a more complex implementation, we might invalidate tokens or handle refresh tokens
    res.json({ message: "Logged out successfully" });
  }),

  /**
   * Check if email exists
   */
  checkEmail: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;

    const user = await UserModel.findByEmail(email);
    res.json({ exists: !!user });
  }),

  /**
   * Update user profile
   */
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const { fullName, email, currentPassword, newPassword } = req.body;

    // Get current user
    const user = await UserModel.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res
          .status(400)
          .json({ message: "Current password is required" });
      }

      const validPassword = await comparePasswords(
        currentPassword,
        user.password!,
      );
      if (!validPassword) {
        return res
          .status(401)
          .json({ message: "Current password is incorrect" });
      }
    }

    // Update user
    const updatedUser = await UserModel.update(req.userId, {
      fullName,
      email,
      password: newPassword,
    });

    // Remove password from response
    if (updatedUser) {
      delete updatedUser.password;
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  }),
};
