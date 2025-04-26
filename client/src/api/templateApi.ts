import axios from "axios";

interface PromptTemplate {
  id: number;
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isGlobal: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface CreatePromptTemplateData {
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isGlobal?: boolean;
}

interface UpdatePromptTemplateData extends Partial<CreatePromptTemplateData> {}

interface TemplateListResponse {
  templates: PromptTemplate[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface TemplateListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isGlobal?: boolean;
  createdBy?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const templateApi = {
  /**
   * Get all templates with filtering and pagination
   */
  getTemplates: async (
    params: TemplateListParams = {},
    token: string,
  ): Promise<TemplateListResponse> => {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isGlobal,
      createdBy,
      sortBy = "name",
      sortOrder = "asc",
    } = params;

    let url = `/api/prompt-templates?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    if (category) {
      url += `&category=${encodeURIComponent(category)}`;
    }

    if (isGlobal !== undefined) {
      url += `&isGlobal=${isGlobal}`;
    }

    if (createdBy) {
      url += `&createdBy=${createdBy}`;
    }

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data;
  },

  /**
   * Get template by ID
   */
  getTemplate: async (id: number, token: string): Promise<PromptTemplate> => {
    const response = await axios.get(`/api/prompt-templates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.template;
  },

  /**
   * Create new template
   */
  createTemplate: async (
    data: CreatePromptTemplateData,
    token: string,
  ): Promise<PromptTemplate> => {
    const response = await axios.post("/api/prompt-templates", data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.template;
  },

  /**
   * Update template
   */
  updateTemplate: async (
    id: number,
    data: UpdatePromptTemplateData,
    token: string,
  ): Promise<PromptTemplate> => {
    const response = await axios.put(`/api/prompt-templates/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.template;
  },

  /**
   * Delete template
   */
  deleteTemplate: async (id: number, token: string): Promise<void> => {
    await axios.delete(`/api/prompt-templates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Increment template usage count
   */
  incrementUsageCount: async (id: number, token: string): Promise<void> => {
    await axios.post(
      `/api/prompt-templates/${id}/increment-usage`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },

  /**
   * Get all template categories
   */
  getCategories: async (token: string): Promise<string[]> => {
    const response = await axios.get("/api/prompt-templates/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.categories;
  },

  /**
   * Set role access for a template
   */
  setRoleAccess: async (
    templateId: number,
    roleId: number,
    access: { canView?: boolean; canEdit?: boolean; canDelete?: boolean },
    token: string,
  ): Promise<void> => {
    await axios.post(
      `/api/prompt-templates/${templateId}/access`,
      { roleId, ...access },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
  deleteTemplate: async (id: number, token: string): Promise<void> => {
    await axios.delete(`/api/prompt-templates/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Increment template usage count
   */
  incrementUsageCount: async (id: number, token: string): Promise<void> => {
    await axios.post(
      `/api/prompt-templates/${id}/increment-usage`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },

  /**
   * Get all template categories
   */
  getCategories: async (token: string): Promise<string[]> => {
    const response = await axios.get("/api/prompt-templates/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.categories;
  },

  /**
   * Set role access for a template
   */
  setRoleAccess: async (
    templateId: number,
    roleId: number,
    access: { canView?: boolean; canEdit?: boolean; canDelete?: boolean },
    token: string,
  ): Promise<void> => {
    await axios.post(
      `/api/prompt-templates/${templateId}/access`,
      { roleId, ...access },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  },
};
