import axios from "axios";

export interface ResponseFormat {
  id: number;
  name: string;
  description?: string;
  structure: ResponseFormatStructure;
  category?: string;
  tags?: string[];
  isGlobal: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  creator?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface ResponseFormatStructure {
  title?: string;
  intro?: string;
  content_blocks?: Array<{
    type: "text" | "list" | "code" | "quote" | "image" | "table" | "custom";
    content: string | string[] | Record<string, any>;
    heading?: string;
  }>;
  faq?: Array<{
    question: string;
    answer: string;
  }>;
  actions?: Array<{
    label: string;
    url?: string;
    type: "link" | "button" | "download" | "copy";
    style?: "primary" | "secondary" | "outline" | "ghost";
  }>;
  disclaimer?: string;
  metadata?: Record<string, any>;
}

export interface CreateResponseFormatData {
  name: string;
  description?: string;
  structure: ResponseFormatStructure;
  category?: string;
  tags?: string[];
  isGlobal?: boolean;
}

export interface UpdateResponseFormatData
  extends Partial<CreateResponseFormatData> {}

export interface ResponseFormatListResponse {
  formats: ResponseFormat[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ResponseFormatListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isGlobal?: boolean;
  createdBy?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const responseFormatApi = {
  /**
   * Get all response formats with filtering and pagination
   */
  getFormats: async (
    params: ResponseFormatListParams = {},
    token: string,
  ): Promise<ResponseFormatListResponse> => {
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

    let url = `/api/response-formats?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

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
   * Get response format by ID
   */
  getFormat: async (id: number, token: string): Promise<ResponseFormat> => {
    const response = await axios.get(`/api/response-formats/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.format;
  },

  /**
   * Create new response format
   */
  createFormat: async (
    data: CreateResponseFormatData,
    token: string,
  ): Promise<ResponseFormat> => {
    const response = await axios.post("/api/response-formats", data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.format;
  },

  /**
   * Update response format
   */
  updateFormat: async (
    id: number,
    data: UpdateResponseFormatData,
    token: string,
  ): Promise<ResponseFormat> => {
    const response = await axios.put(`/api/response-formats/${id}`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.format;
  },

  /**
   * Delete response format
   */
  deleteFormat: async (id: number, token: string): Promise<void> => {
    await axios.delete(`/api/response-formats/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  /**
   * Increment format usage count
   */
  incrementUsageCount: async (id: number, token: string): Promise<void> => {
    await axios.post(
      `/api/response-formats/${id}/increment-usage`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
  },

  /**
   * Get all response format categories
   */
  getCategories: async (token: string): Promise<string[]> => {
    const response = await axios.get("/api/response-formats/categories", {
      headers: { Authorization: `Bearer ${token}` },
    });

    return response.data.categories;
  },

  /**
   * Apply a response format to text content
   */
  applyFormat: async (
    formatId: number,
    content: string,
    token: string,
  ): Promise<ResponseFormatStructure> => {
    const response = await axios.post(
      `/api/response-formats/${formatId}/apply`,
      { content },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return response.data.formattedResponse;
  },

  /**
   * Preview how content would look with a specific format
   */
  previewFormat: async (
    structure: ResponseFormatStructure,
    content: string,
    token: string,
  ): Promise<ResponseFormatStructure> => {
    const response = await axios.post(
      `/api/response-formats/preview`,
      { structure, content },
      { headers: { Authorization: `Bearer ${token}` } },
    );

    return response.data.preview;
  },
};
