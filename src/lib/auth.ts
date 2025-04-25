import { jwtVerify, SignJWT } from "jose";
import bcrypt from "bcryptjs";
import pool from "./db";

// Secret key for JWT signing
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-should-be-at-least-32-chars",
);

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
  const token = await new SignJWT({
    sub: user.id.toString(),
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(JWT_SECRET);

  return token;
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.sub || !payload.email || !payload.role) {
      return null;
    }

    return {
      id: parseInt(payload.sub as string),
      email: payload.email as string,
      fullName: (payload.name as string) || "",
      role: payload.role as string,
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
