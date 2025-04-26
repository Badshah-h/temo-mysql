import express from "express";
import { ConversationController } from "../controllers/conversation.controller";
import { authenticate } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Get user conversations
router.get("/", ConversationController.getUserConversations);

// Get conversation by ID
router.get("/:id", ConversationController.getConversationById);

// Create conversation
router.post("/", ConversationController.createConversation);

// Delete conversation
router.delete("/:id", ConversationController.deleteConversation);

// Delete all user conversations
router.delete("/", ConversationController.deleteAllUserConversations);

export default router;
