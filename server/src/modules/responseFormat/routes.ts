import express from "express";
import { ResponseFormatController } from "./controller";
import { authenticate, requirePermissions } from "../../middleware/auth";
import {
  validateCreateResponseFormat,
  validateUpdateResponseFormat,
} from "./validators";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get all response formats
router.get("/", ResponseFormatController.getAll);

// Get response format categories
router.get("/categories", ResponseFormatController.getCategories);

// Get response format by ID
router.get("/:id", ResponseFormatController.getById);

// Create a new response format
router.post("/", validateCreateResponseFormat, ResponseFormatController.create);

// Update response format
router.put(
  "/:id",
  validateUpdateResponseFormat,
  ResponseFormatController.update,
);

// Delete response format
router.delete("/:id", ResponseFormatController.delete);

export default router;
