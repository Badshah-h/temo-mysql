import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import pool from "./db.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Secret key for JWT signing
const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-should-be-at-least-32-chars";
const JWT_EXPIRY = process.env.JWT_EXPIRY || "2h";

// User types
export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
}

export interface UserWithPassword extends User {
  password: string;
}

// Authentication functions
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function createUser(
  email: string,
  password: string,
  fullName: string,
): Promise<User | null> {
  try {
    const hashedPassword = await hashPassword(password);

    const [result] = await pool.execute(
      "INSERT INTO users (email, password, full_name, role) VALUES (?, ?, ?, ?)",
      [email, hashedPassword, fullName, "user"],
    );

    const insertId = (result as any).insertId;

    if (insertId) {
      return {
        id: insertId,
        email,
        fullName,
        role: "user",
      };
    }

    return null;
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function findUserByEmail(
  email: string,
): Promise<UserWithPassword | null> {
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, password, full_name as fullName, role FROM users WHERE email = ?",
      [email],
    );

    const users = rows as UserWithPassword[];

    if (users.length === 0) {
      return null;
    }

    return users[0];
  } catch (error) {
    console.error("Error finding user:", error);
    return null;
  }
}

export async function generateToken(user: User): Promise<string> {
  return jwt.sign(
    {
      sub: user.id.toString(),
      email: user.email,
      role: user.role,
      name: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY },
  );
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as jwt.JwtPayload;

    if (!decoded.sub || !decoded.email || !decoded.role) {
      return null;
    }

    return {
      id: parseInt(decoded.sub as string),
      email: decoded.email as string,
      fullName: (decoded.name as string) || "",
      role: decoded.role as string,
    };
  } catch (error) {
    console.error("Error verifying token:", error);
    return null;
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: User; token: string } | null> {
  try {
    const user = await findUserByEmail(email);

    if (!user) {
      return null;
    }

    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      return null;
    }

    // Update last login timestamp
    await pool.execute(
      "UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?",
      [user.id],
    );

    const { password: _, ...userWithoutPassword } = user;
    const token = await generateToken(userWithoutPassword);

    return {
      user: userWithoutPassword,
      token,
    };
  } catch (error) {
    console.error("Error logging in user:", error);
    return null;
  }
}

export async function createRefreshToken(
  userId: number,
): Promise<string | null> {
  try {
    // Generate a random token
    const refreshToken = crypto.randomUUID();

    // Set expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);

    // Store in database
    await pool.execute(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)",
      [userId, refreshToken, expiryDate],
    );

    return refreshToken;
  } catch (error) {
    console.error("Error creating refresh token:", error);
    return null;
  }
}

export async function verifyRefreshToken(token: string): Promise<User | null> {
  try {
    const [rows] = await pool.execute(
      `SELECT u.id, u.email, u.full_name as fullName, u.role 
       FROM refresh_tokens rt 
       JOIN users u ON rt.user_id = u.id 
       WHERE rt.token = ? AND rt.expires_at > CURRENT_TIMESTAMP AND rt.revoked = FALSE`,
      [token],
    );

    const users = rows as User[];

    if (users.length === 0) {
      return null;
    }

    return users[0];
  } catch (error) {
    console.error("Error verifying refresh token:", error);
    return null;
  }
}

export async function revokeRefreshToken(token: string): Promise<boolean> {
  try {
    await pool.execute(
      "UPDATE refresh_tokens SET revoked = TRUE WHERE token = ?",
      [token],
    );

    return true;
  } catch (error) {
    console.error("Error revoking refresh token:", error);
    return false;
  }
}
