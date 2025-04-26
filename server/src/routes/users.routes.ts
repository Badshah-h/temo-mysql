import express from "express";
import { UserController } from "../controllers/user.controller";
import {
  authenticate,
  authorize,
  requirePermissions,
} from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all users - requires admin role or manage_users permission
router.get("/", requirePermissions("manage_users"), UserController.getAllUsers);

// Get user by ID - requires admin role or manage_users permission
router.get(
  "/:id",
  requirePermissions("manage_users"),
  UserController.getUserById,
);

// Create user - requires admin role or manage_users permission
router.post("/", requirePermissions("manage_users"), UserController.createUser);

// Update user - requires admin role or manage_users permission
router.put(
  "/:id",
  requirePermissions("manage_users"),
  UserController.updateUser,
);

// Delete user - requires admin role
router.delete("/:id", authorize("admin"), UserController.deleteUser);

// Get user roles - requires admin role or manage_users permission
router.get(
  "/:id/roles",
  requirePermissions("manage_users"),
  UserController.getUserRoles,
);

// Assign role to user - requires admin role
router.post("/:id/roles", authorize("admin"), UserController.assignRole);

// Remove role from user - requires admin role
router.delete(
  "/:id/roles/:roleId",
  authorize("admin"),
  UserController.removeRole,
);

export default router;
