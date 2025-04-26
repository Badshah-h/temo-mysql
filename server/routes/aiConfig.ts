import express from "express";
import { authenticate } from "../middleware/auth";
import {
  getModels,
  getModel,
  createModel,
  updateModel,
  deleteModel,
  setDefaultModel,
  getRoutingRules,
  createRoutingRule,
  updateRoutingRule,
  deleteRoutingRule,
  getFallbackConfigs,
  createFallbackConfig,
  updateFallbackConfig,
  deleteFallbackConfig,
  testAIConfiguration,
} from "../api/aiConfig";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// AI Models routes
router.get("/models", getModels);
router.get("/models/:id", getModel);
router.post("/models", createModel);
router.put("/models/:id", updateModel);
router.delete("/models/:id", deleteModel);
router.post("/models/:id/set-default", setDefaultModel);

// AI Routing Rules routes
router.get("/routing-rules", getRoutingRules);
router.post("/routing-rules", createRoutingRule);
router.put("/routing-rules/:id", updateRoutingRule);
router.delete("/routing-rules/:id", deleteRoutingRule);

// AI Fallback Configurations routes
router.get("/fallbacks", getFallbackConfigs);
router.post("/fallbacks", createFallbackConfig);
router.put("/fallbacks/:id", updateFallbackConfig);
router.delete("/fallbacks/:id", deleteFallbackConfig);

// Test AI Configuration route
router.post("/test", testAIConfiguration);

export default router;
