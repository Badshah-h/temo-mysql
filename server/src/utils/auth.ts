import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { User } from "../types";

// Secret key for JWT signing
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-should-be-at-least-32-chars";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "2h";

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a password with a hash
 */
export async function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: User): string {
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
}

/**
 * Verify a JWT token
 */
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

/**
 * Extract user ID from token
 */
export function getUserIdFromToken(token: string): number | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { sub: string };
    return decoded && decoded.sub ? parseInt(decoded.sub, 10) : null;
  } catch (error) {
    console.error("Error extracting user ID from token:", error);
    return null;
  }
}
