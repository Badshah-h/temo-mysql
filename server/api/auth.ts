import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { db } from "../lib/db";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// Register a new user
router.post("/register", async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Check if user already exists
    const existingUser = await db("users").where("email", email).first();
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Begin transaction
    const trx = await db.transaction();

    try {
      // Create user
      const [userId] = await trx("users").insert({
        email,
        password: hashedPassword,
        full_name: fullName,
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Get default role (user)
      const userRole = await trx("roles").where("name", "user").first();

      if (userRole) {
        // Assign default role to user
        await trx("user_roles").insert({
          user_id: userId,
          role_id: userRole.id,
          created_at: new Date(),
        });
      }

      // Commit transaction
      await trx.commit();

      // Get user roles for response
      const userRoles = await db("user_roles")
        .select("roles.id", "roles.name", "roles.description")
        .join("roles", "user_roles.role_id", "roles.id")
        .where("user_roles.user_id", userId);

      // Generate JWT token
      const token = jwt.sign(
        {
          id: userId,
          email,
          role: userRoles.length > 0 ? userRoles[0].name : "user",
        },
        process.env.JWT_SECRET || "your-secret-key",
        { expiresIn: "24h" },
      );

      res.status(201).json({
        message: "User registered successfully",
        token,
        user: {
          id: userId,
          email,
          fullName,
          role: userRoles.length > 0 ? userRoles[0].name : "user",
          roles: userRoles,
        },
      });
    } catch (error) {
      // Rollback transaction on error
      await trx.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
});

// Login user
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await db("users").where("email", email).first();
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Get user roles
    const userRoles = await db("user_roles")
      .select("roles.id", "roles.name", "roles.description")
      .join("roles", "user_roles.role_id", "roles.id")
      .where("user_roles.user_id", user.id);

    // Update last login timestamp
    await db("users").where("id", user.id).update({ last_login: db.fn.now() });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: userRoles.length > 0 ? userRoles[0].name : "user",
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: userRoles.length > 0 ? userRoles[0].name : "user",
        roles: userRoles,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
});

// Get current user
router.get("/me", authenticate, async (req, res) => {
  try {
    const user = await db("users").where("id", req.user.id).first();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get user roles
    const userRoles = await db("user_roles")
      .select("roles.id", "roles.name", "roles.description")
      .join("roles", "user_roles.role_id", "roles.id")
      .where("user_roles.user_id", user.id);

    // Get user permissions through roles
    const userPermissions = await db("permissions")
      .distinct("permissions.id", "permissions.name", "permissions.description")
      .join(
        "role_permissions",
        "permissions.id",
        "role_permissions.permission_id",
      )
      .join("user_roles", "role_permissions.role_id", "user_roles.role_id")
      .where("user_roles.user_id", user.id);

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: userRoles.length > 0 ? userRoles[0].name : "user",
      roles: userRoles,
      permissions: userPermissions,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({ message: "Failed to get user information" });
  }
});

export default router;
