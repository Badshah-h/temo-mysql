// DEPRECATED: All authentication logic has been moved to server/modules/auth/.
// This file is intentionally left blank to avoid duplication and confusion.

import bcrypt from "bcryptjs/umd/types";
import * as jsonwebtoken from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

// dotenv.config();

// Secret key for JWT - in production, this should be in environment variables
const JWT_SECRET: Secret = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare a password with a hash
 */
export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export async function generateToken(payload: Record<string, any>): Promise<string> {
  try {
    // Use the synchronous version to avoid callback issues
    const signOptions: SignOptions = { expiresIn: JWT_EXPIRES_IN as any };
    return jsonwebtoken.sign(payload, JWT_SECRET, signOptions);
  } catch (error) {
    console.error('Error generating token:', error);
    throw new Error('Unable to generate token');
  }
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<any> {
  try {
    // Use the synchronous version to avoid callback issues
    return jsonwebtoken.verify(token, JWT_SECRET);
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}
