import express from "express";
import { TemplateController } from "../controllers/template.controller";
import { authenticate, requirePermissions } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all templates - requires manage_templates permission or admin
router.get(
  "/",
  requirePermissions("manage_templates"),
  TemplateController.getAllTemplates,
);

// Get template by ID - requires manage_templates permission or admin
router.get(
  "/:id",
  requirePermissions("manage_templates"),
  TemplateController.getTemplateById,
);

// Create template - requires manage_templates permission or admin
router.post(
  "/",
  requirePermissions("manage_templates"),
  TemplateController.createTemplate,
);

// Update template - requires manage_templates permission or admin
router.put(
  "/:id",
  requirePermissions("manage_templates"),
  TemplateController.updateTemplate,
);

// Delete template - requires manage_templates permission or admin
router.delete(
  "/:id",
  requirePermissions("manage_templates"),
  TemplateController.deleteTemplate,
);

// Get all template categories - requires manage_templates permission or admin
router.get(
  "/categories",
  requirePermissions("manage_templates"),
  TemplateController.getCategories,
);

export default router;
