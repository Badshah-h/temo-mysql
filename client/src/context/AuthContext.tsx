import React, { createContext, useContext, useState, useEffect } from "react";
import { User, verifyToken } from "../lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Function to load auth state from localStorage
  const loadAuthState = async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("auth_token");
      if (storedToken) {
        // Only verify with server
        try {
          const response = await fetch("/api/auth/me", {
            headers: { Authorization: `Bearer ${storedToken}` },
          });

          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
            setToken(storedToken);
          } else {
            throw new Error("Server token verification failed");
          }
        } catch (serverError) {
          localStorage.removeItem("auth_token");
          setUser(null);
          setToken(null);
        }
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      localStorage.removeItem("auth_token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAuthState();

    // Add event listener for storage changes (for multi-tab support)
    window.addEventListener("storage", (event) => {
      if (event.key === "auth_token") {
        if (event.newValue) {
          loadAuthState();
        } else {
          // Token was removed in another tab
          setUser(null);
          setToken(null);
        }
      }
    });

    return () => {
      window.removeEventListener("storage", () => {});
    };
  }, []);

  const login = (newToken: string, userData: User) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  };

  // Check if user has a specific role
  const hasRole = (roleName: string): boolean => {
    if (!user) return false;

    // Check all roles
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

    // Check direct permissions if available
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
    isLoading,
    isAdmin,
    hasRole,
    hasPermission,
    login,
    logout,
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
