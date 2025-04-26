import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { UserModel } from "../db/models/User.js";

// Secret key for JWT signing
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-should-be-at-least-32-chars";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "2h";

/**
 * Hash a password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

/**
 * Compare a password with a hash
 */
export async function comparePasswords(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user) {
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
export async function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded;
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}
