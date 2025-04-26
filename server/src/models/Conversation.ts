import { db } from "../db";
import { Conversation } from "../types";

export class ConversationModel {
  /**
   * Find conversation by ID
   */
  static async findById(id: number): Promise<Conversation | null> {
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
  }

  /**
   * Get user conversations with pagination
   */
  static async findByUser(
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
  }> {
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
  }

  /**
   * Create a new conversation
   */
  static async create(conversationData: {
    userId: number;
    templateId: number;
    responseFormatId?: number;
    query: string;
    response: object;
    rawResponse?: string;
    variables?: object;
  }): Promise<Conversation> {
    try {
      const [id] = await db("conversations").insert({
        user_id: conversationData.userId,
        template_id: conversationData.templateId,
        response_format_id: conversationData.responseFormatId,
        query: conversationData.query,
        response: JSON.stringify(conversationData.response),
        raw_response: conversationData.rawResponse,
        variables: conversationData.variables
          ? JSON.stringify(conversationData.variables)
          : "{}",
        created_at: new Date(),
      });

      return this.findById(id) as Promise<Conversation>;
    } catch (error) {
      console.error("Error creating conversation:", error);
      throw error;
    }
  }

  /**
   * Delete conversation
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db("conversations").where("id", id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting conversation:", error);
      return false;
    }
  }

  /**
   * Delete all user conversations
   */
  static async deleteByUser(userId: number): Promise<boolean> {
    try {
      await db("conversations").where("user_id", userId).delete();
      return true;
    } catch (error) {
      console.error("Error deleting user conversations:", error);
      return false;
    }
  }
}
