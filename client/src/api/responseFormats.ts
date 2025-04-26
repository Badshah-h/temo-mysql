import { apiClient } from "./index";
import { ResponseFormat } from "../types";

export interface ResponseFormatListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isGlobal?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ResponseFormatListResponse {
  formats: ResponseFormat[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateResponseFormatRequest {
  name: string;
  description?: string;
  structure: object;
  category?: string;
  tags?: string[];
  isGlobal?: boolean;
}

export interface UpdateResponseFormatRequest {
  name?: string;
  description?: string;
  structure?: object;
  category?: string;
  tags?: string[];
  isGlobal?: boolean;
}

export const responseFormatsApi = {
  /**
   * Get all response formats with pagination and filtering
   */
  getAll: (
    params: ResponseFormatListParams = {},
  ): Promise<ResponseFormatListResponse> => {
    return apiClient.get<ResponseFormatListResponse>("/response-formats", {
      params,
    });
  },

  /**
   * Get response format by ID
   */
  getById: (id: number): Promise<ResponseFormat> => {
    return apiClient.get<ResponseFormat>(`/response-formats/${id}`);
  },

  /**
   * Create a new response format
   */
  create: (data: CreateResponseFormatRequest): Promise<ResponseFormat> => {
    return apiClient.post<ResponseFormat>("/response-formats", data);
  },

  /**
   * Update response format
   */
  update: (
    id: number,
    data: UpdateResponseFormatRequest,
  ): Promise<ResponseFormat> => {
    return apiClient.put<ResponseFormat>(`/response-formats/${id}`, data);
  },

  /**
   * Delete response format
   */
  delete: (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/response-formats/${id}`);
  },

  /**
   * Get all response format categories
   */
  getCategories: (): Promise<string[]> => {
    return apiClient.get<string[]>("/response-formats/categories");
  },
};
