import express from "express";
import { PermissionController } from "./controller";
import { authenticate, requirePermissions } from "../../middleware/auth";
import {
  validateCreatePermission,
  validateUpdatePermission,
} from "./validators";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all permissions
router.get("/", PermissionController.getAllPermissions);

// Get permission by ID
router.get("/:id", PermissionController.getPermissionById);

// Create a new permission (requires manage_permissions permission)
router.post(
  "/",
  requirePermissions("manage_permissions"),
  validateCreatePermission,
  PermissionController.createPermission,
);

// Update permission (requires manage_permissions permission)
router.put(
  "/:id",
  requirePermissions("manage_permissions"),
  validateUpdatePermission,
  PermissionController.updatePermission,
);

// Delete permission (requires manage_permissions permission)
router.delete(
  "/:id",
  requirePermissions("manage_permissions"),
  PermissionController.deletePermission,
);

// Get roles with permission
router.get(
  "/:id/roles",
  requirePermissions("manage_permissions"),
  PermissionController.getPermissionRoles,
);

export default router;
