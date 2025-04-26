import { Request, Response } from "express";
import { ConversationService } from "./service";
import { TemplateService } from "../template/service";
import { ResponseFormatService } from "../responseFormat/service";
import { asyncHandler } from "../../middleware/errorHandler";
import { AppError } from "../../middleware/errorHandler";

export const ConversationController = {
  /**
   * Process a chat message
   */
  processMessage: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { templateId, responseFormatId, query, variables } = req.body;

    // Check if template exists
    const template = await TemplateService.findById(templateId);
    if (!template) {
      throw new AppError("Template not found", 404);
    }

    // Check if response format exists if provided
    if (responseFormatId) {
      const format = await ResponseFormatService.findById(responseFormatId);
      if (!format) {
        throw new AppError("Response format not found", 404);
      }
    }

    // Process the message
    const result = await ConversationService.processMessage({
      userId: req.userId,
      templateId,
      responseFormatId,
      query,
      variables,
    });

    res.json(result);
  }),

  /**
   * Get conversation history
   */
  getHistory: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await ConversationService.getHistory(req.userId, {
      page,
      limit,
    });

    res.json(result);
  }),

  /**
   * Get conversation by ID
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;
    const conversation = await ConversationService.findById(parseInt(id));

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    // Check if the conversation belongs to the user
    if (conversation.userId !== req.userId) {
      throw new AppError("Not authorized to access this conversation", 403);
    }

    res.json(conversation);
  }),

  /**
   * Delete conversation
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;
    const conversation = await ConversationService.findById(parseInt(id));

    if (!conversation) {
      throw new AppError("Conversation not found", 404);
    }

    // Check if the conversation belongs to the user
    if (conversation.userId !== req.userId) {
      throw new AppError("Not authorized to delete this conversation", 403);
    }

    await ConversationService.delete(parseInt(id));

    res.json({ message: "Conversation deleted successfully" });
  }),

  /**
   * Delete all user conversations
   */
  deleteAll: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    await ConversationService.deleteByUser(req.userId);

    res.json({ message: "All conversations deleted successfully" });
  }),
};
