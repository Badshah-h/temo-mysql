import express from "express";
import { ConversationController } from "./controller";
import { authenticate } from "../../middleware/auth";
import { validateProcessMessage } from "./validators";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Process a chat message
router.post(
  "/process",
  validateProcessMessage,
  ConversationController.processMessage,
);

// Get conversation history
router.get("/history", ConversationController.getHistory);

// Get conversation by ID
router.get("/:id", ConversationController.getById);

// Delete conversation
router.delete("/:id", ConversationController.delete);

// Delete all user conversations
router.delete("/", ConversationController.deleteAll);

export default router;
