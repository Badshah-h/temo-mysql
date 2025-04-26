import { apiClient } from "./index";
import { WidgetConfig } from "../types";

export interface CreateWidgetConfigRequest {
  name: string;
  config: object;
  isActive?: boolean;
}

export interface UpdateWidgetConfigRequest {
  name?: string;
  config?: object;
  isActive?: boolean;
}

export const widgetConfigsApi = {
  /**
   * Get all widget configs
   */
  getAll: (): Promise<WidgetConfig[]> => {
    return apiClient.get<WidgetConfig[]>("/widget-configs");
  },

  /**
   * Get widget config by ID
   */
  getById: (id: number): Promise<WidgetConfig> => {
    return apiClient.get<WidgetConfig>(`/widget-configs/${id}`);
  },

  /**
   * Create a new widget config
   */
  create: (data: CreateWidgetConfigRequest): Promise<WidgetConfig> => {
    return apiClient.post<WidgetConfig>("/widget-configs", data);
  },

  /**
   * Update widget config
   */
  update: (
    id: number,
    data: UpdateWidgetConfigRequest,
  ): Promise<WidgetConfig> => {
    return apiClient.put<WidgetConfig>(`/widget-configs/${id}`, data);
  },

  /**
   * Delete widget config
   */
  delete: (id: number): Promise<{ message: string }> => {
    return apiClient.delete<{ message: string }>(`/widget-configs/${id}`);
  },

  /**
   * Set a widget config as active
   */
  setActive: (id: number): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(
      `/widget-configs/${id}/activate`,
    );
  },

  /**
   * Get active widget config
   */
  getActive: (): Promise<WidgetConfig> => {
    return apiClient.get<WidgetConfig>("/widget-configs/active");
  },

  /**
   * Get widget embed code
   */
  getEmbedCode: (id: number): Promise<{ code: string }> => {
    return apiClient.get<{ code: string }>(`/widget-configs/${id}/embed-code`);
  },
};
