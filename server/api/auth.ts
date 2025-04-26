import express from "express";
import {
  createUser,
  loginUser,
  verifyToken,
  generateToken,
  comparePasswords,
} from "../lib/auth.js";
import pool from "../lib/db.js";

const router = express.Router();

// Register endpoint
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      "SELECT id FROM users WHERE email = ?",
      [email],
    );

    if ((existingUsers as any[]).length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create new user
    const user = await createUser(email, password, fullName);

    if (!user) {
      return res.status(500).json({ message: "Failed to create user" });
    }

    // Generate token
    const loginResult = await loginUser(email, password);

    if (!loginResult) {
      return res
        .status(500)
        .json({ message: "Failed to generate login token" });
    }

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      token: loginResult.token,
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

    // For development/testing purposes only - allow admin login without database check
    if (email === "admin@example.com" && password === "admin123") {
      const adminUser = {
        id: 1,
        email: "admin@example.com",
        fullName: "Admin User",
        role: "admin",
      };

      try {
        // Generate token
        const token = generateToken(adminUser);

        return res.json({
          message: "Login successful",
          user: adminUser,
          token: token,
        });
      } catch (tokenError: any) {
        console.error("Token generation error:", tokenError);
        return res.status(500).json({ message: "Authentication system error" });
      }
    }

    try {
      // Attempt login from database
      const result = await loginUser(email, password);

      if (!result) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Login successful
      return res.json({
        message: "Login successful",
        user: result.user,
        token: result.token,
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
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const user = await verifyToken(token);

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
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
