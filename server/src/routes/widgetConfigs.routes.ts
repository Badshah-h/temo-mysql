import express from "express";
import { WidgetConfigController } from "../controllers/widgetConfig.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all widget configs for current user
router.get("/", WidgetConfigController.getUserConfigs);

// Get widget config by ID
router.get("/:id", WidgetConfigController.getConfigById);

// Create widget config
router.post("/", WidgetConfigController.createConfig);

// Update widget config
router.put("/:id", WidgetConfigController.updateConfig);

// Delete widget config
router.delete("/:id", WidgetConfigController.deleteConfig);

// Set widget config as active
router.post("/:id/activate", WidgetConfigController.setActiveConfig);

// Get active widget config
router.get("/active", WidgetConfigController.getActiveConfig);

export default router;
