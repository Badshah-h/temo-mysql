import axios from "axios";
import { User, Tenant } from "../types/auth";

// Create an axios instance with base URL
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Add tenant header if available
  const tenantData = localStorage.getItem("current_tenant");
  if (tenantData) {
    try {
      const tenant = JSON.parse(tenantData);
      if (tenant && tenant.slug) {
        config.headers["X-Tenant"] = tenant.slug;
      }
    } catch (e) {
      console.error("Error parsing tenant data for request header:", e);
    }
  }

  return config;
});

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string, tenantSlug?: string) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
        tenantSlug: tenantSlug || "default",
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (
    fullName: string,
    email: string,
    password: string,
    tenantSlug?: string,
    role?: string,
  ) => {
    try {
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
        tenantSlug: tenantSlug || "default",
        role, // Optional role parameter
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("auth_token");
      localStorage.removeItem("current_tenant");
    } catch (error) {
      console.error("Logout error:", error);
      // Still remove the token even if the API call fails
      localStorage.removeItem("auth_token");
      localStorage.removeItem("current_tenant");
    }
  },

  refreshToken: async () => {
    try {
      const response = await api.post("/auth/refresh-token");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  getCurrentUser: async (): Promise<{ user: User; tenant: Tenant }> => {
    try {
      const response = await api.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get user roles
  getUserRoles: async (userId: number): Promise<any> => {
    try {
      const response = await api.get(`/users/${userId}/roles`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Assign role to user
  assignRole: async (userId: number, roleId: number): Promise<any> => {
    try {
      const response = await api.post(`/users/${userId}/roles`, { roleId });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Remove role from user
  removeRole: async (userId: number, roleId: number): Promise<any> => {
    try {
      const response = await api.delete(`/users/${userId}/roles/${roleId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Fetch tenants
  getTenants: async () => {
    try {
      const response = await api.get("/tenants");
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Create a new tenant
  createTenant: async (tenantData: {
    name: string;
    slug: string;
    logoUrl?: string;
    primaryColor?: string;
    secondaryColor?: string;
  }) => {
    try {
      const response = await api.post("/tenants", tenantData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Update tenant
  updateTenant: async (
    tenantId: number,
    tenantData: {
      name?: string;
      logoUrl?: string;
      primaryColor?: string;
      secondaryColor?: string;
    },
  ) => {
    try {
      const response = await api.put(`/tenants/${tenantId}`, tenantData);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Get tenant by slug
  getTenantBySlug: async (slug: string) => {
    try {
      const response = await api.get(`/tenants/by-slug/${slug}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },
};

export default api;
