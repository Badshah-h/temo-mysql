import express from "express";
import pool from "../lib/db.js";
import { authenticate, checkRole } from "../middleware/auth.js";

const router = express.Router();

// Get all users (admin only)
router.get("/", authenticate, checkRole("admin"), async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, email, full_name as fullName, role, created_at as createdAt FROM users",
    );

    res.json({ users: rows });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get user by ID (admin or own user)
router.get("/:id", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Check if user is requesting their own data or is an admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const [rows] = await pool.execute(
      "SELECT id, email, full_name as fullName, role, created_at as createdAt FROM users WHERE id = ?",
      [userId],
    );

    const users = rows as any[];

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user (admin or own user)
router.put("/:id", authenticate, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { fullName, email } = req.body;

    // Check if user is updating their own data or is an admin
    if (req.user.id !== userId && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    // Validate input
    if (!fullName || !email) {
      return res
        .status(400)
        .json({ message: "Full name and email are required" });
    }

    await pool.execute(
      "UPDATE users SET full_name = ?, email = ? WHERE id = ?",
      [fullName, email, userId],
    );

    res.json({ message: "User updated successfully" });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user role (admin only)
router.put("/:id/role", authenticate, checkRole("admin"), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { role } = req.body;

    // Validate input
    if (!role || !["admin", "user", "moderator"].includes(role)) {
      return res.status(400).json({ message: "Valid role is required" });
    }

    await pool.execute("UPDATE users SET role = ? WHERE id = ?", [
      role,
      userId,
    ]);

    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete user (admin only)
router.delete("/:id", authenticate, checkRole("admin"), async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Prevent deleting yourself
    if (req.user.id === userId) {
      return res
        .status(400)
        .json({ message: "Cannot delete your own account" });
    }

    await pool.execute("DELETE FROM users WHERE id = ?", [userId]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
