import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/authApi";

interface Role {
  id: number;
  name: string;
  description?: string;
}

interface Permission {
  id: number;
  name: string;
  description?: string;
}

interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  roles?: Role[];
  permissions?: Permission[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<void>;
  logout: () => void;
  updateProfile: (data: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken);
      fetchCurrentUser(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const userData = await authApi.getCurrentUser(authToken);
      setUser(userData);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { token: authToken, user: userData } = await authApi.login(
      email,
      password,
    );
    localStorage.setItem("token", authToken);
    setToken(authToken);
    setUser(userData);
  };

  const register = async (
    email: string,
    password: string,
    fullName: string,
  ) => {
    const { token: authToken, user: userData } = await authApi.register(
      email,
      password,
      fullName,
    );
    localStorage.setItem("token", authToken);
    setToken(authToken);
    setUser(userData);
  };

  const updateProfile = async (data: {
    fullName?: string;
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    if (!token) throw new Error("Not authenticated");

    const { user: updatedUser } = await authApi.updateProfile(token, data);
    setUser(updatedUser);
  };

  const logout = () => {
    if (token) {
      // Try to notify the server, but don't wait for response
      authApi.logout(token).catch((err) => console.error("Logout error:", err));
    }

    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Check if user has a specific role
  const hasRole = (roleName: string): boolean => {
    if (!user) return false;

    // Check primary role for backward compatibility
    if (user.role === roleName) return true;

    // Check all roles if available
    if (user.roles && user.roles.length > 0) {
      return user.roles.some((role) => role.name === roleName);
    }

    return false;
  };

  // Check if user has a specific permission
  const hasPermission = (permissionName: string): boolean => {
    if (!user) return false;

    // Admin has all permissions
    if (hasRole("admin")) return true;

    // Check permissions if available
    if (user.permissions && user.permissions.length > 0) {
      return user.permissions.some(
        (permission) => permission.name === permissionName,
      );
    }

    return false;
  };

  const isAdmin = hasRole("admin");

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isAdmin,
    hasRole,
    hasPermission,
    login,
    register,
    logout,
    updateProfile,
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
