import express from "express";
import { TemplateController } from "./controller";
import { authenticate } from "../../middleware/auth";
import { validateCreateTemplate, validateUpdateTemplate } from "./validators";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all templates
router.get("/", TemplateController.getAll);

// Get template categories
router.get("/categories", TemplateController.getCategories);

// Get template by ID
router.get("/:id", TemplateController.getById);

// Create a new template
router.post("/", validateCreateTemplate, TemplateController.create);

// Update template
router.put("/:id", validateUpdateTemplate, TemplateController.update);

// Delete template
router.delete("/:id", TemplateController.delete);

export default router;
