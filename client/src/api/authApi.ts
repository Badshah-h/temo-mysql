import axios from "axios";

interface LoginResponse {
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
    roles?: Array<{ id: number; name: string; description?: string }>;
  };
}

interface RegisterResponse {
  token: string;
  user: {
    id: number;
    email: string;
    fullName: string;
    role: string;
    roles?: Array<{ id: number; name: string; description?: string }>;
  };
}

interface UserResponse {
  id: number;
  email: string;
  fullName: string;
  role: string;
  roles?: Array<{ id: number; name: string; description?: string }>;
  permissions?: Array<{ id: number; name: string; description?: string }>;
}

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post("/api/auth/login", {
      email,
      password,
    });
    return response.data;
  },

  register: async (
    email: string,
    password: string,
    fullName: string,
  ): Promise<RegisterResponse> => {
    const response = await axios.post("/api/auth/register", {
      email,
      password,
      fullName,
    });
    return response.data;
  },

  getCurrentUser: async (token: string): Promise<UserResponse> => {
    const response = await axios.get("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  updateProfile: async (
    token: string,
    data: {
      fullName?: string;
      email?: string;
      currentPassword?: string;
      newPassword?: string;
    },
  ): Promise<{ message: string; user: UserResponse }> => {
    const response = await axios.put("/api/auth/profile", data, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  },

  logout: async (token: string): Promise<{ message: string }> => {
    const response = await axios.post(
      "/api/auth/logout",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response.data;
  },

  checkEmail: async (email: string): Promise<{ exists: boolean }> => {
    const response = await axios.get(`/api/auth/check-email/${email}`);
    return response.data;
  },
};
