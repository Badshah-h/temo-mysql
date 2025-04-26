import { jwtVerify, SignJWT } from "jose";

/**
 * Auth utility file for client/browser-safe mock operations.
 * In production, all sensitive operations (user creation, password hashing, etc.)
 * should be handled server-side through secure APIs.
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

// Secret key for JWT signing (from Vite env or fallback for testing)
const JWT_SECRET = new TextEncoder().encode(
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_JWT_SECRET) ||
    "fallback-secret-key-must-be-32+chars",
);

// -------------------
// Types
// -------------------

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
  roles?: Role[];
  permissions?: Permission[];
}

export interface UserWithPassword extends User {
  password: string;
}

// -------------------
// Mock Password Utilities (Client-side Only)
// -------------------

export async function hashPassword(password: string): Promise<string> {
  if (isBrowser) {
    console.warn("⚠️ Password hashing should be done server-side.");
    return `hashed_${password}`;
  }
  throw new Error("hashPassword should not be used outside of browser mock");
}

export async function comparePasswords(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  if (isBrowser) {
    console.warn("⚠️ Password comparison should be done server-side.");
    return hashedPassword === `hashed_${password}`;
  }
  throw new Error(
    "comparePasswords should not be used outside of browser mock",
  );
}

// -------------------
// Mock User Utilities
// -------------------

export async function createUser(
  email: string,
  password: string,
  fullName: string,
): Promise<User | null> {
  if (isBrowser) {
    console.warn("⚠️ User creation should be done via API.");
    return {
      id: 1,
      email,
      fullName,
      roles: [{ id: 1, name: "user", description: "Regular user" }],
    };
  }
  return null;
}

export async function findUserByEmail(
  email: string,
): Promise<UserWithPassword | null> {
  if (isBrowser) {
    console.warn("⚠️ User lookup should be done via API.");

    // Simple mock for testing
    if (email === "admin@example.com") {
      return {
        id: 1,
        email,
        fullName: "Admin User",
        roles: [{ id: 2, name: "admin", description: "Administrator" }],
        password: "hashed_admin123",
      };
    }
  }
  return null;
}

// -------------------
// JWT Utilities
// -------------------

export async function generateToken(user: User): Promise<string> {
  return await new SignJWT({
    sub: user.id.toString(),
    email: user.email,
    name: user.fullName,
    roles: user.roles?.map((r) => r.name) || [],
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!payload.sub || !payload.email || !payload.roles) return null;

    const roles = (payload.roles as string[]) || [];

    return {
      id: parseInt(payload.sub as string, 10),
      email: payload.email as string,
      fullName: (payload.name as string) || "",
      roles: roles.map((name) => ({ id: 0, name })),
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// -------------------
// Login (Browser Mock Only)
// -------------------

export async function loginUser(
  email: string,
  password: string,
): Promise<{ user: User; token: string } | null> {
  if (isBrowser) {
    console.warn("⚠️ Login should be done via secure API.");

    if (email === "admin@example.com" && password === "admin123") {
      const user: User = {
        id: 1,
        email,
        fullName: "Admin User",
        roles: [{ id: 2, name: "admin", description: "Administrator" }],
      };

      const token = await generateToken(user);
      return { user, token };
    }
  }
  return null;
}
