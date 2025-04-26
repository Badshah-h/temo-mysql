import { apiClient } from "./index";
import { Template } from "../types";

export interface TemplateListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isGlobal?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface TemplateListResponse {
  templates: Template[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateTemplateRequest {
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  isGlobal?: boolean;
  responseFormatId?: number;
}

export interface UpdateTemplateRequest {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isGlobal?: boolean;
  responseFormatId?: number;
}

export const templatesApi = {
  /**
   * Get all templates with pagination and filtering
   */
  getAll: (params: TemplateListParams = {}): Promise<TemplateListResponse> => {
    return apiClient.get<TemplateListResponse>("/templates", { params });
  },

  /**
   * Get template by ID
   */
  getById: (id: number): Promise<Template> => {
    return apiClient.get<Template>(`/templates/${id}`);
  },

  /**
   * Create a new template
   */
  create: (data: CreateTemplateRequest): Promise<Template> => {
    return apiClient.post<Template>("/templates", data);
  },

  /**
   * Update template
   */
  update: (id: number, data: UpdateTemplateRequest): Promise<Template> => {
    return apiClient.put<Template>(`/templates/${id}`, data);
  },

  /**
   * Delete template
   */
  delete: (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/templates/${id}`);
  },

  /**
   * Get all template categories
   */
  getCategories: (): Promise<string[]> => {
    return apiClient.get<string[]>("/templates/categories");
  },
};
