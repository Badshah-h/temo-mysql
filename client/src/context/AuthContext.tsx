import React, { createContext, useContext, useState, useEffect } from "react";
import { User, verifyToken } from "../lib/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
        // First check if token is valid on client side
        const userData = await verifyToken(storedToken);
        if (userData) {
          // Then verify with server
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
            console.error("Server verification failed:", serverError);
            localStorage.removeItem("auth_token");
            setUser(null);
            setToken(null);
          }
        } else {
          // Token is invalid or expired
          localStorage.removeItem("auth_token");
          setUser(null);
          setToken(null);
        }
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading auth state:", error);
      localStorage.removeItem("auth_token");
      setUser(null);
      setToken(null);
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

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
