import express from "express";
import { RoleController } from "../controllers/role.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all roles - requires admin role
router.get("/", authorize("admin"), RoleController.getAllRoles);

// Get role by ID - requires admin role
router.get("/:id", authorize("admin"), RoleController.getRoleById);

// Create role - requires admin role
router.post("/", authorize("admin"), RoleController.createRole);

// Update role - requires admin role
router.put("/:id", authorize("admin"), RoleController.updateRole);

// Delete role - requires admin role
router.delete("/:id", authorize("admin"), RoleController.deleteRole);

// Get role permissions - requires admin role
router.get(
  "/:id/permissions",
  authorize("admin"),
  RoleController.getRolePermissions,
);

// Assign permission to role - requires admin role
router.post(
  "/:id/permissions",
  authorize("admin"),
  RoleController.assignPermission,
);

// Remove permission from role - requires admin role
router.delete(
  "/:id/permissions/:permissionId",
  authorize("admin"),
  RoleController.removePermission,
);

// Get users with role - requires admin role
router.get("/:id/users", authorize("admin"), RoleController.getRoleUsers);

export default router;
