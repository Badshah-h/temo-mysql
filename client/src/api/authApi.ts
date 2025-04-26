import axios from "axios";
import { User } from "../types/auth";

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
  return config;
});

// Auth API endpoints
export const authApi = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  register: async (
    fullName: string,
    email: string,
    password: string,
    role?: string,
  ) => {
    try {
      const response = await api.post("/auth/register", {
        fullName,
        email,
        password,
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
    } catch (error) {
      console.error("Logout error:", error);
      // Still remove the token even if the API call fails
      localStorage.removeItem("auth_token");
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

  getCurrentUser: async (): Promise<{ user: User }> => {
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
};

export default api;
