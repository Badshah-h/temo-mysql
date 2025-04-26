import { Request, Response } from "express";
import { UserService } from "../user/service";
import { AuthService } from "./service";
import { asyncHandler } from "../../middleware/errorHandler";
import { AppError } from "../../middleware/errorHandler";

export const AuthController = {
  /**
   * Register a new user
   */
  register: asyncHandler(async (req: Request, res: Response) => {
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
      role: role || "user",
    });

    // Generate token
    const token = AuthService.generateToken(user);

    // Return user data and token
    res.status(201).json({
      message: "User registered successfully",
      token,
      user: AuthService.sanitizeUser(user),
    });
  }),

  /**
   * Login user
   */
  login: asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Authenticate user
    const { user, token } = await AuthService.authenticate(email, password);

    // Update last login timestamp
    await UserService.updateLastLogin(user.id);

    res.json({
      message: "Login successful",
      token,
      user: AuthService.sanitizeUser(user),
    });
  }),

  /**
   * Get current user
   */
  getCurrentUser: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const user = await UserService.findById(req.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.json(AuthService.sanitizeUser(user));
  }),

  /**
   * Logout user
   */
  logout: asyncHandler(async (_req: Request, res: Response) => {
    // In a more complex implementation, we might invalidate tokens or handle refresh tokens
    res.json({ message: "Logged out successfully" });
  }),

  /**
   * Check if email exists
   */
  checkEmail: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.params;

    const user = await UserService.findByEmail(email);
    res.json({ exists: !!user });
  }),

  /**
   * Update user profile
   */
  updateProfile: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { fullName, email, currentPassword, newPassword } = req.body;

    // Get current user
    const user = await UserService.findById(req.userId);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        throw new AppError("Current password is required", 400);
      }

      const validPassword = await AuthService.verifyPassword(
        currentPassword,
        user.password!,
      );
      if (!validPassword) {
        throw new AppError("Current password is incorrect", 401);
      }
    }

    // Update user
    const updatedUser = await UserService.update(req.userId, {
      fullName,
      email,
      password: newPassword,
    });

    res.json({
      message: "Profile updated successfully",
      user: AuthService.sanitizeUser(updatedUser!),
    });
  }),
};
