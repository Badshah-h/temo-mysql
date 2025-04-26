import axios from "axios";

export interface AIModelConfig {
  id: number;
  name: string;
  provider: string; // "gemini", "huggingface", "custom"
  apiKey?: string;
  baseUrl?: string;
  model: string;
  temperature: number;
  maxTokens: number;
  stopSequences?: string[];
  systemPrompt?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AIRoutingRule {
  id: number;
  name: string;
  description?: string;
  condition: {
    type: string; // "keyword", "regex", "category", "length", "language"
    value: string | string[] | number;
  };
  targetModelId: number;
  priority: number;
  isActive: boolean;
}

export interface AIFallbackConfig {
  id: number;
  name: string;
  description?: string;
  triggerCondition: string; // "error", "timeout", "low_confidence", "content_filter"
  action: string; // "use_alternative_model", "use_static_response", "notify_admin"
  alternativeModelId?: number;
  staticResponse?: string;
  isActive: boolean;
}

export const aiConfigApi = {
  // AI Models
  async getModels(token: string) {
    const response = await axios.get("/api/ai/models", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.models;
  },

  async getModel(id: number, token: string) {
    const response = await axios.get(`/api/ai/models/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.model;
  },

  async createModel(model: Partial<AIModelConfig>, token: string) {
    const response = await axios.post("/api/ai/models", model, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.model;
  },

  async updateModel(id: number, model: Partial<AIModelConfig>, token: string) {
    const response = await axios.put(`/api/ai/models/${id}`, model, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.model;
  },

  async deleteModel(id: number, token: string) {
    const response = await axios.delete(`/api/ai/models/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  async setDefaultModel(id: number, token: string) {
    const response = await axios.post(
      `/api/ai/models/${id}/set-default`,
      {},
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },

  // AI Routing Rules
  async getRoutingRules(token: string) {
    const response = await axios.get("/api/ai/routing-rules", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.rules;
  },

  async createRoutingRule(rule: Partial<AIRoutingRule>, token: string) {
    const response = await axios.post("/api/ai/routing-rules", rule, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.rule;
  },

  async updateRoutingRule(
    id: number,
    rule: Partial<AIRoutingRule>,
    token: string,
  ) {
    const response = await axios.put(`/api/ai/routing-rules/${id}`, rule, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.rule;
  },

  async deleteRoutingRule(id: number, token: string) {
    const response = await axios.delete(`/api/ai/routing-rules/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // AI Fallback Configurations
  async getFallbackConfigs(token: string) {
    const response = await axios.get("/api/ai/fallbacks", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.fallbacks;
  },

  async createFallbackConfig(
    fallback: Partial<AIFallbackConfig>,
    token: string,
  ) {
    const response = await axios.post("/api/ai/fallbacks", fallback, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.fallback;
  },

  async updateFallbackConfig(
    id: number,
    fallback: Partial<AIFallbackConfig>,
    token: string,
  ) {
    const response = await axios.put(`/api/ai/fallbacks/${id}`, fallback, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.fallback;
  },

  async deleteFallbackConfig(id: number, token: string) {
    const response = await axios.delete(`/api/ai/fallbacks/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  // Test AI Configuration
  async testConfiguration({
    query,
    templateId,
    formatId,
    modelId,
    variables,
    token,
  }: {
    query: string;
    templateId: number;
    formatId?: number;
    modelId?: number;
    variables?: Record<string, any>;
    token: string;
  }) {
    const response = await axios.post(
      "/api/ai/test",
      {
        query,
        templateId,
        formatId,
        modelId,
        variables,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return response.data;
  },
};
