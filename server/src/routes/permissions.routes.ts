import express from "express";
import { PermissionController } from "../controllers/permission.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all permissions - requires admin role
router.get("/", authorize("admin"), PermissionController.getAllPermissions);

// Get permission by ID - requires admin role
router.get("/:id", authorize("admin"), PermissionController.getPermissionById);

// Create permission - requires admin role
router.post("/", authorize("admin"), PermissionController.createPermission);

// Update permission - requires admin role
router.put("/:id", authorize("admin"), PermissionController.updatePermission);

// Delete permission - requires admin role
router.delete(
  "/:id",
  authorize("admin"),
  PermissionController.deletePermission,
);

// Get roles with permission - requires admin role
router.get(
  "/:id/roles",
  authorize("admin"),
  PermissionController.getPermissionRoles,
);

export default router;
