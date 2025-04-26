import express from "express";
import { ResponseFormatController } from "../controllers/responseFormat.controller";
import { authenticate, requirePermissions } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all formats - requires manage_formats permission or admin
router.get(
  "/",
  requirePermissions("manage_formats"),
  ResponseFormatController.getAllFormats,
);

// Get format by ID - requires manage_formats permission or admin
router.get(
  "/:id",
  requirePermissions("manage_formats"),
  ResponseFormatController.getFormatById,
);

// Create format - requires manage_formats permission or admin
router.post(
  "/",
  requirePermissions("manage_formats"),
  ResponseFormatController.createFormat,
);

// Update format - requires manage_formats permission or admin
router.put(
  "/:id",
  requirePermissions("manage_formats"),
  ResponseFormatController.updateFormat,
);

// Delete format - requires manage_formats permission or admin
router.delete(
  "/:id",
  requirePermissions("manage_formats"),
  ResponseFormatController.deleteFormat,
);

// Get all format categories - requires manage_formats permission or admin
router.get(
  "/categories",
  requirePermissions("manage_formats"),
  ResponseFormatController.getCategories,
);

export default router;
