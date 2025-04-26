import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../../types";
import { UserService } from "../user/service";
import { AppError } from "../../middleware/errorHandler";

// Secret key for JWT signing
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-should-be-at-least-32-chars";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "2h";

export const AuthService = {
  /**
   * Hash a password
   */
  hashPassword: async (password: string): Promise<string> => {
    return bcrypt.hash(password, 10);
  },

  /**
   * Verify a password against a hash
   */
  verifyPassword: async (
    password: string,
    hashedPassword: string,
  ): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
  },

  /**
   * Generate a JWT token for a user
   */
  generateToken: (user: User): string => {
    try {
      // Create the payload
      const payload = {
        sub: user.id.toString(),
        email: user.email,
        name: user.fullName,
        role: user.role, // Include primary role for backward compatibility
        roles: user.roles ? user.roles.map((r) => r.name) : [], // Include all roles
      };

      // Sign the token
      return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRY });
    } catch (error) {
      console.error("Error generating token:", error);
      throw new Error("Failed to generate token");
    }
  },

  /**
   * Verify a JWT token
   */
  verifyToken: (token: string): any => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      console.error("Error verifying token:", error);
      return null;
    }
  },

  /**
   * Extract user ID from token
   */
  getUserIdFromToken: (token: string): number | null => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
      return decoded && decoded.sub ? parseInt(decoded.sub, 10) : null;
    } catch (error) {
      console.error("Error extracting user ID from token:", error);
      return null;
    }
  },

  /**
   * Authenticate a user with email and password
   */
  authenticate: async (
    email: string,
    password: string,
  ): Promise<{ user: User; token: string }> => {
    // Find user
    const user = await UserService.findByEmailWithRoles(email);
    if (!user) {
      throw new AppError("Invalid credentials", 401);
    }

    // Check password
    const validPassword = await AuthService.verifyPassword(
      password,
      user.password!,
    );
    if (!validPassword) {
      throw new AppError("Invalid credentials", 401);
    }

    // Generate token
    const token = AuthService.generateToken(user);

    return { user, token };
  },

  /**
   * Remove sensitive data from user object
   */
  sanitizeUser: (user: User): Omit<User, "password"> => {
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
  },
};
