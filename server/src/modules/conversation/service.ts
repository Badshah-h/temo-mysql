import { db } from "../../db";
import { Conversation } from "../../types";
import { TemplateService } from "../template/service";
import { ResponseFormatService } from "../responseFormat/service";

export const ConversationService = {
  /**
   * Find conversation by ID
   */
  findById: async (id: number): Promise<Conversation | null> => {
    try {
      const conversation = await db("conversations")
        .where("id", id)
        .select(
          "id",
          "user_id as userId",
          "template_id as templateId",
          "response_format_id as responseFormatId",
          "query",
          "response",
          "raw_response as rawResponse",
          "variables",
          "created_at as createdAt",
        )
        .first();

      return conversation || null;
    } catch (error) {
      console.error("Error finding conversation by ID:", error);
      throw error;
    }
  },

  /**
   * Get user conversations with pagination
   */
  getHistory: async (
    userId: number,
    params: {
      page?: number;
      limit?: number;
    },
  ): Promise<{
    conversations: Array<
      Conversation & {
        templateName?: string;
        formatName?: string;
      }
    >;
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    try {
      const { page = 1, limit = 10 } = params;
      const offset = (page - 1) * limit;

      // Get conversations with template and format names
      const conversations = await db("conversations")
        .select(
          "conversations.id",
          "conversations.user_id as userId",
          "conversations.template_id as templateId",
          "conversations.response_format_id as responseFormatId",
          "conversations.query",
          "conversations.response",
          "conversations.raw_response as rawResponse",
          "conversations.variables",
          "conversations.created_at as createdAt",
          "templates.name as templateName",
          "response_formats.name as formatName",
        )
        .leftJoin("templates", "conversations.template_id", "templates.id")
        .leftJoin(
          "response_formats",
          "conversations.response_format_id",
          "response_formats.id",
        )
        .where("conversations.user_id", userId)
        .orderBy("conversations.created_at", "desc")
        .limit(limit)
        .offset(offset);

      // Count total conversations
      const [{ count }] = await db("conversations")
        .where("user_id", userId)
        .count("* as count");

      return {
        conversations,
        pagination: {
          total: Number(count),
          page,
          limit,
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    } catch (error) {
      console.error("Error finding conversations by user:", error);
      throw error;
    }
  },

  /**
   * Process a message and create a conversation
   */
  processMessage: async (data: {
    userId: number;
    templateId: number;
    responseFormatId?: number;
    query: string;
    variables?: Record<string, any>;
  }): Promise<{
    conversationId: number;
    response: any;
    formatted: boolean;
    usage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  }> => {
    try {
      // Get template
      const template = await TemplateService.findById(data.templateId);
      if (!template) {
        throw new Error("Template not found");
      }

      // Increment template usage count
      await TemplateService.incrementUsageCount(data.templateId);

      // Get response format if provided
      let responseFormat = null;
      if (data.responseFormatId) {
        responseFormat = await ResponseFormatService.findById(
          data.responseFormatId,
        );
        if (responseFormat) {
          await ResponseFormatService.incrementUsageCount(
            data.responseFormatId,
          );
        }
      }

      // Process the query using the template
      // This is a placeholder for the actual AI processing logic
      // In a real implementation, this would call an AI service
      const processedResponse = {
        content: `Response to: ${data.query}`,
        usage: {
          promptTokens: 10,
          completionTokens: 20,
          totalTokens: 30,
        },
      };

      // Format the response if a format is provided
      let formattedResponse = processedResponse.content;
      let isFormatted = false;

      if (responseFormat) {
        try {
          const formatStructure = JSON.parse(responseFormat.structure);
          // Apply the format to the response
          // This is a placeholder for the actual formatting logic
          formattedResponse = {
            ...formatStructure,
            content: processedResponse.content,
          };
          isFormatted = true;
        } catch (formatError) {
          console.error("Error formatting response:", formatError);
        }
      }

      // Create conversation record
      const [conversationId] = await db("conversations").insert({
        user_id: data.userId,
        template_id: data.templateId,
        response_format_id: data.responseFormatId,
        query: data.query,
        response: JSON.stringify(formattedResponse),
        raw_response: JSON.stringify(processedResponse),
        variables: JSON.stringify(data.variables || {}),
        created_at: new Date(),
      });

      return {
        conversationId,
        response: formattedResponse,
        formatted: isFormatted,
        usage: processedResponse.usage,
      };
    } catch (error) {
      console.error("Error processing message:", error);
      throw error;
    }
  },

  /**
   * Delete conversation
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await db("conversations").where("id", id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      throw error;
    }
  },

  /**
   * Delete all user conversations
   */
  deleteByUser: async (userId: number): Promise<boolean> => {
    try {
      await db("conversations").where("user_id", userId).delete();
      return true;
    } catch (error) {
      console.error("Error deleting user conversations:", error);
      throw error;
    }
  },
};
