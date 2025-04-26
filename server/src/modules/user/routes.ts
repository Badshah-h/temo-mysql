import express from "express";
import { UserController } from "./controller";
import { authenticate, requirePermissions } from "../../middleware/auth";
import { validateCreateUser, validateUpdateUser } from "./validators";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users (requires manage_users permission)
router.get("/", requirePermissions("manage_users"), UserController.getAllUsers);

// Get user by ID
router.get(
  "/:id",
  requirePermissions("manage_users"),
  UserController.getUserById,
);

// Create a new user (requires manage_users permission)
router.post(
  "/",
  requirePermissions("manage_users"),
  validateCreateUser,
  UserController.createUser,
);

// Update user (requires manage_users permission)
router.put(
  "/:id",
  requirePermissions("manage_users"),
  validateUpdateUser,
  UserController.updateUser,
);

// Delete user (requires manage_users permission)
router.delete(
  "/:id",
  requirePermissions("manage_users"),
  UserController.deleteUser,
);

// Get user roles
router.get(
  "/:id/roles",
  requirePermissions("manage_users"),
  UserController.getUserRoles,
);

// Assign role to user
router.post(
  "/:id/roles",
  requirePermissions("manage_users"),
  UserController.assignRole,
);

// Remove role from user
router.delete(
  "/:id/roles/:roleId",
  requirePermissions("manage_users"),
  UserController.removeRole,
);

export default router;
