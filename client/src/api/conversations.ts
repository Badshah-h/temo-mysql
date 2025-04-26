import { apiClient } from "./index";
import { Conversation } from "../types";

export interface ConversationListParams {
  page?: number;
  limit?: number;
}

export interface ConversationListResponse {
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
}

export interface CreateConversationRequest {
  templateId: number;
  responseFormatId?: number;
  query: string;
  variables?: Record<string, any>;
}

export interface ConversationResponse {
  conversationId: number;
  response: any;
  formatted: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export const conversationsApi = {
  /**
   * Process a chat message
   */
  processMessage: (
    data: CreateConversationRequest,
  ): Promise<ConversationResponse> => {
    return apiClient.post<ConversationResponse>("/conversations/process", data);
  },

  /**
   * Get conversation history
   */
  getHistory: (
    params: ConversationListParams = {},
  ): Promise<ConversationListResponse> => {
    return apiClient.get<ConversationListResponse>("/conversations/history", {
      params,
    });
  },

  /**
   * Get conversation by ID
   */
  getById: (id: number): Promise<Conversation> => {
    return apiClient.get<Conversation>(`/conversations/${id}`);
  },

  /**
   * Delete conversation
   */
  delete: (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/conversations/${id}`);
  },

  /**
   * Delete all user conversations
   */
  deleteAll: (): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>("/conversations");
  },
};
