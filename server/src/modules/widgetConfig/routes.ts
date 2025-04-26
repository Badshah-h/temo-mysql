import express from "express";
import { WidgetConfigController } from "./controller";
import { authenticate } from "../../middleware/auth";
import {
  validateCreateWidgetConfig,
  validateUpdateWidgetConfig,
} from "./validators";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all widget configs
router.get("/", WidgetConfigController.getAll);

// Get active widget config
router.get("/active", WidgetConfigController.getActive);

// Get widget config by ID
router.get("/:id", WidgetConfigController.getById);

// Get widget embed code
router.get("/:id/embed-code", WidgetConfigController.getEmbedCode);

// Create a new widget config
router.post("/", validateCreateWidgetConfig, WidgetConfigController.create);

// Update widget config
router.put("/:id", validateUpdateWidgetConfig, WidgetConfigController.update);

// Delete widget config
router.delete("/:id", WidgetConfigController.delete);

// Set a widget config as active
router.post("/:id/activate", WidgetConfigController.setActive);

export default router;
