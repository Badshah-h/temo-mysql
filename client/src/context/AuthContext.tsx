import * as React from "react";
import { User } from "../lib/auth";

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

// Create context with a default value
const AuthContext = React.createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  hasRole: () => false,
  hasPermission: () => false,
  login: () => {},
  logout: () => {},
});

// Export the context itself
export { AuthContext };

// Export the hook as a constant for better HMR compatibility
export const useAuth = () => {
  return React.useContext(AuthContext);
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Function to load auth state from localStorage
  const loadAuthState = React.useCallback(async () => {
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
  }, []);

  React.useEffect(() => {
    loadAuthState();

    // Add event listener for storage changes (for multi-tab support)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "auth_token") {
        if (event.newValue) {
          loadAuthState();
        } else {
          // Token was removed in another tab
          setUser(null);
          setToken(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadAuthState]);

  const login = React.useCallback((newToken: string, userData: User) => {
    localStorage.setItem("auth_token", newToken);
    setToken(newToken);
    setUser(userData);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem("auth_token");
    setToken(null);
    setUser(null);
  }, []);

  // Check if user has a specific role
  const hasRole = React.useCallback(
    (roleName: string): boolean => {
      if (!user) return false;

      // Check all roles
      if (user.roles && user.roles.length > 0) {
        return user.roles.some((role) => role.name === roleName);
      }

      return false;
    },
    [user],
  );

  // Check if user has a specific permission
  const hasPermission = React.useCallback(
    (permissionName: string): boolean => {
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
    },
    [user, hasRole],
  );

  const isAdmin = hasRole("admin");

  const contextValue = React.useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user,
      isLoading,
      isAdmin,
      hasRole,
      hasPermission,
      login,
      logout,
    }),
    [user, token, isLoading, isAdmin, hasRole, hasPermission, login, logout],
  );

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
