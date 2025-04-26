import axios from "axios";

export interface ChatRequest {
  query: string;
  templateId: number;
  variables?: Record<string, any>;
}

export interface ChatResponse {
  conversationId: number;
  response: any;
  formatted: boolean;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface Conversation {
  id: number;
  query: string;
  response: any;
  rawResponse?: string;
  variables: Record<string, any>;
  templateId: number;
  templateName: string;
  responseFormatId?: number;
  formatName?: string;
  createdAt: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const chatApi = {
  /**
   * Process a chat message
   */
  processMessage: async (
    data: ChatRequest,
    token: string,
  ): Promise<ChatResponse> => {
    const response = await axios.post("/api/chat/process", data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  },

  /**
   * Get conversation history
   */
  getHistory: async (
    params: { page?: number; limit?: number } = {},
    token: string,
  ): Promise<ConversationListResponse> => {
    const { page = 1, limit = 10 } = params;

    const response = await axios.get(
      `/api/chat/history?page=${page}&limit=${limit}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return response.data;
  },
};
