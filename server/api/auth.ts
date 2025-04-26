import express from "express";
import { authenticate } from "../middleware/auth";
import { verifyToken, generateToken, comparePasswords } from "../lib/auth.js";
import { UserModel } from "../db/models/User.js";
import { RoleModel } from "../db/models/Role.js";
import pool from "../lib/db.js";

const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create new user with role
    const userData = {
      email,
      password,
      fullName,
      role: role || "user", // Default to 'user' if not specified
    };

    const user = await UserModel.create(userData);

    if (!user) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Get user with roles for response
    const userWithRoles = await UserModel.findByIdWithRolesAndPermissions(
      user.id,
    );

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        roles: userWithRoles?.roles || [],
      },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login endpoint
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Admin users must be properly authenticated through the database

    try {
      // Find user by email
      const user = await UserModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get user with password for verification
      const [rows] = await pool.execute(
        "SELECT password FROM users WHERE id = ?",
        [user.id],
      );
      const userWithPassword = rows[0] as { password: string };

      // Check password
      const validPassword = await comparePasswords(
        password,
        userWithPassword.password,
      );
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Get user with roles and permissions
      const userWithRoles = await UserModel.findByIdWithRolesAndPermissions(
        user.id,
      );

      // Update last login timestamp
      await UserModel.updateLastLogin(user.id);

      // Generate JWT token
      const token = generateToken({
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      });

      // Login successful
      return res.json({
        message: "Login successful",
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          roles: userWithRoles?.roles || [],
        },
        token,
      });
    } catch (error: any) {
      console.error("Login process error:", error);

      // Check if it's a token generation error
      if (
        error.message &&
        typeof error.message === "string" &&
        error.message.includes("Unable to generate token")
      ) {
        return res.status(500).json({ message: "Authentication system error" });
      }

      // Default error
      return res
        .status(500)
        .json({ message: "Login failed due to server error" });
    }
  } catch (error) {
    console.error("Login endpoint error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get current user endpoint
router.get("/me", authenticate, async (req, res) => {
  try {
    const userWithRoles = await UserModel.findByIdWithRolesAndPermissions(
      req.user.id,
    );

    if (!userWithRoles) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: userWithRoles.id,
        email: userWithRoles.email,
        fullName: userWithRoles.fullName,
        role: userWithRoles.role,
        roles: userWithRoles.roles || [],
        permissions: userWithRoles.permissions || [],
      },
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Logout endpoint
router.post("/logout", (_req, res) => {
  // Client-side will handle token removal
  res.json({ message: "Logged out successfully" });
});

export default router;
