import * as React from "react";
import { User } from "../lib/auth";
import { Tenant } from "../types/auth";

interface AuthContextType {
  user: User | null;
  token: string | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  login: (token: string, user: User, tenant?: Tenant) => void;
  logout: () => void;
  setCurrentTenant: (tenant: Tenant) => void;
}

// Create context with a default value
const AuthContext = React.createContext<AuthContextType>({
  user: null,
  token: null,
  tenant: null,
  isAuthenticated: false,
  isLoading: true,
  isAdmin: false,
  hasRole: () => false,
  hasPermission: () => false,
  login: () => {},
  logout: () => {},
  setCurrentTenant: () => {},
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
  const [tenant, setTenant] = React.useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Function to load auth state from localStorage
  const loadAuthState = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const storedToken = localStorage.getItem("auth_token");
      const storedTenant = localStorage.getItem("current_tenant");

      if (storedTenant) {
        try {
          setTenant(JSON.parse(storedTenant));
        } catch (e) {
          console.error("Error parsing stored tenant:", e);
          localStorage.removeItem("current_tenant");
        }
      }

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

            // If tenant info is in the response and we don't have it yet
            if (data.tenant && !tenant) {
              setTenant(data.tenant);
              localStorage.setItem(
                "current_tenant",
                JSON.stringify(data.tenant),
              );
            }
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
  }, [tenant]);

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
      } else if (event.key === "current_tenant") {
        if (event.newValue) {
          try {
            setTenant(JSON.parse(event.newValue));
          } catch (e) {
            console.error("Error parsing tenant from storage event:", e);
          }
        } else {
          setTenant(null);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadAuthState]);

  const login = React.useCallback(
    (newToken: string, userData: User, tenantData?: Tenant) => {
      localStorage.setItem("auth_token", newToken);
      setToken(newToken);
      setUser(userData);

      if (tenantData) {
        setTenant(tenantData);
        localStorage.setItem("current_tenant", JSON.stringify(tenantData));
      } else if (userData.tenant) {
        setTenant(userData.tenant);
        localStorage.setItem("current_tenant", JSON.stringify(userData.tenant));
      }
    },
    [],
  );

  const logout = React.useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("current_tenant");
    setToken(null);
    setUser(null);
    setTenant(null);
  }, []);

  const setCurrentTenant = React.useCallback((tenantData: Tenant) => {
    setTenant(tenantData);
    localStorage.setItem("current_tenant", JSON.stringify(tenantData));
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
      tenant,
      isAuthenticated: !!user,
      isLoading,
      isAdmin,
      hasRole,
      hasPermission,
      login,
      logout,
      setCurrentTenant,
    }),
    [
      user,
      token,
      tenant,
      isLoading,
      isAdmin,
      hasRole,
      hasPermission,
      login,
      logout,
      setCurrentTenant,
    ],
  );

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}
