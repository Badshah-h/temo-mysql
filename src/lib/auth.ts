import { jwtVerify, SignJWT } from "jose";
// Import browser-compatible db mock
import pool from "./db";

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Secret key for JWT signing - use import.meta.env for Vite or fallback to a default
const JWT_SECRET = new TextEncoder().encode(
  import.meta.env.VITE_JWT_SECRET ||
    "your-secret-key-should-be-at-least-32-chars",
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

// Browser-compatible password hashing (simplified for browser)
export async function hashPassword(password: string): Promise<string> {
  // In browser, we'll use a simple mock since bcrypt isn't available
  // In a real app, password hashing should ONLY happen on the server
  console.warn("Password hashing should be done server-side");
  return `hashed_${password}`;
}

export async function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  // Simple mock for browser environment
  console.warn("Password comparison should be done server-side");
  return hashedPassword === `hashed_${password}`;
}

export async function createUser(
  email: string,
  password: string,
  fullName: string,
): Promise<User | null> {
  try {
    // In a real app, this would be an API call to the server
    console.warn("User creation should be done via API call");

    // Mock implementation for browser
    return {
      id: 1,
      email,
      fullName,
      role: "user",
    };
  } catch (error) {
    console.error("Error creating user:", error);
    return null;
  }
}

export async function findUserByEmail(
  email: string,
): Promise<UserWithPassword | null> {
  try {
    // In a real app, this would be an API call
    console.warn("User lookup should be done via API call");

    // Mock data for testing in browser
    if (email === "admin@example.com") {
      return {
        id: 1,
        email: "admin@example.com",
        fullName: "Admin User",
        role: "admin",
        password: "hashed_admin123",
      };
    }

    return null;
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
    // In a real app, this would be an API call
    console.warn("Login should be done via API call");

    // Mock implementation for browser testing
    if (email === "admin@example.com" && password === "admin123") {
      const user = {
        id: 1,
        email: "admin@example.com",
        fullName: "Admin User",
        role: "admin",
      };

      const token = await generateToken(user);

      return {
        user,
        token,
      };
    }

    return null;
  } catch (error) {
    console.error("Error logging in user:", error);
    return null;
  }
}
