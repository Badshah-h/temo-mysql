import express from "express";
import { RoleController } from "./controller";
import { authenticate, requirePermissions } from "../../middleware/auth";
import { validateCreateRole, validateUpdateRole } from "./validators";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all roles
router.get("/", RoleController.getAllRoles);

// Get role by ID
router.get("/:id", RoleController.getRoleById);

// Create a new role (requires manage_roles permission)
router.post(
  "/",
  requirePermissions("manage_roles"),
  validateCreateRole,
  RoleController.createRole,
);

// Update role (requires manage_roles permission)
router.put(
  "/:id",
  requirePermissions("manage_roles"),
  validateUpdateRole,
  RoleController.updateRole,
);

// Delete role (requires manage_roles permission)
router.delete(
  "/:id",
  requirePermissions("manage_roles"),
  RoleController.deleteRole,
);

// Get role permissions
router.get("/:id/permissions", RoleController.getRolePermissions);

// Assign permission to role (requires manage_roles permission)
router.post(
  "/:id/permissions",
  requirePermissions("manage_roles"),
  RoleController.assignPermission,
);

// Remove permission from role (requires manage_roles permission)
router.delete(
  "/:id/permissions/:permissionId",
  requirePermissions("manage_roles"),
  RoleController.removePermission,
);

// Get users with role
router.get(
  "/:id/users",
  requirePermissions("manage_roles"),
  RoleController.getRoleUsers,
);

export default router;
