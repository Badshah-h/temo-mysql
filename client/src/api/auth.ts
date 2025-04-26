import { apiClient } from "./index";
import { User, LoginResponse, RegisterResponse } from "../types/auth";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role?: string;
}

export interface UpdateProfileRequest {
  email?: string;
  fullName?: string;
  currentPassword?: string;
  newPassword?: string;
}

export const authApi = {
  /**
   * Login user
   */
  login: (data: LoginRequest): Promise<LoginResponse> => {
    return apiClient.post<LoginResponse>("/auth/login", data);
  },

  /**
   * Register new user
   */
  register: (data: RegisterRequest): Promise<RegisterResponse> => {
    return apiClient.post<RegisterResponse>("/auth/register", data);
  },

  /**
   * Get current user
   */
  getCurrentUser: (): Promise<User> => {
    return apiClient.get<User>("/auth/me");
  },

  /**
   * Logout user
   */
  logout: (): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>("/auth/logout");
  },

  /**
   * Check if email exists
   */
  checkEmail: (email: string): Promise<{ exists: boolean }> => {
    return apiClient.get<{ exists: boolean }>(`/auth/check-email/${email}`);
  },

  /**
   * Update user profile
   */
  updateProfile: (
    data: UpdateProfileRequest,
  ): Promise<{ message: string; user: User }> => {
    return apiClient.put<{ message: string; user: User }>(
      "/auth/profile",
      data,
    );
  },
};
