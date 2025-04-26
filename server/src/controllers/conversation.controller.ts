import { Request, Response } from "express";
import { ConversationModel } from "../models/Conversation";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";

export const ConversationController = {
  /**
   * Get user conversations with pagination
   */
  getUserConversations: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { page, limit } = req.query;

    const conversations = await ConversationModel.findByUser(req.userId, {
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
    });

    res.json(conversations);
  }),

  /**
   * Get conversation by ID
   */
  getConversationById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const conversation = await ConversationModel.findById(parseInt(id));

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    // Check if user owns this conversation
    if (conversation.userId !== req.userId) {
      throw new AppError("Not authorized to access this conversation", 403);
    }

    res.json(conversation);
  }),

  /**
   * Create a new conversation
   */
  createConversation: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const {
      templateId,
      responseFormatId,
      query,
      response,
      rawResponse,
      variables,
    } = req.body;

    if (!templateId || !query || !response) {
      throw new AppError("Template ID, query, and response are required", 400);
    }

    const conversation = await ConversationModel.create({
      userId: req.userId,
      templateId,
      responseFormatId,
      query,
      response,
      rawResponse,
      variables,
    });

    res.status(201).json(conversation);
  }),

  /**
   * Delete conversation
   */
  deleteConversation: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const conversationId = parseInt(id);

    // Check if conversation exists and belongs to user
    const conversation = await ConversationModel.findById(conversationId);
    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    if (conversation.userId !== req.userId) {
      throw new AppError("Not authorized to delete this conversation", 403);
    }

    // Delete conversation
    await ConversationModel.delete(conversationId);

    res.json({ message: "Conversation deleted successfully" });
  }),

  /**
   * Delete all user conversations
   */
  deleteAllUserConversations: asyncHandler(
    async (req: Request, res: Response) => {
      if (!req.userId) {
        throw new AppError("Not authenticated", 401);
      }

      await ConversationModel.deleteByUser(req.userId);

      res.json({ message: "All conversations deleted successfully" });
    },
  ),
};
