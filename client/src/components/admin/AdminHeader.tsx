import React, { useState, useEffect } from "react";
import { Bell, Search, Settings, Building, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/authApi";
import { Tenant } from "@/types/auth";

interface AdminHeaderProps {
  title: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
  const { user, tenant, logout, setCurrentTenant } = useAuth();
  const [availableTenants, setAvailableTenants] = useState<Tenant[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);

  // Fetch available tenants for the current user
  useEffect(() => {
    const fetchUserTenants = async () => {
      if (!user) return;

      setIsLoadingTenants(true);
      try {
        const response = await authApi.getTenants();
        setAvailableTenants(response.tenants || []);
      } catch (error) {
        console.error("Failed to fetch user tenants:", error);
      } finally {
        setIsLoadingTenants(false);
      }
    };

    fetchUserTenants();
  }, [user]);

  const handleTenantSwitch = (newTenant: Tenant) => {
    setCurrentTenant(newTenant);
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <header
      className="bg-white border-b border-slate-200 py-3 px-6 flex items-center justify-between"
      style={
        tenant?.primaryColor
          ? {
              borderColor: `${tenant.primaryColor}20`, // 20% opacity version of primary color
            }
          : undefined
      }
    >
      <h1 className="text-xl font-semibold text-slate-800">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search..."
            className="pl-8 h-9 bg-slate-50 border-slate-200 focus:bg-white"
          />
        </div>

        {/* Tenant Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              style={
                tenant?.primaryColor
                  ? {
                      borderColor: tenant.primaryColor,
                      color: tenant.primaryColor,
                    }
                  : undefined
              }
            >
              <Building className="h-4 w-4" />
              <span className="max-w-[120px] truncate">
                {tenant?.name || "Select Organization"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {isLoadingTenants ? (
              <div className="p-2 text-center text-sm text-slate-500">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-t-primary border-slate-200 rounded-full mr-2"></div>
                Loading...
              </div>
            ) : availableTenants.length > 0 ? (
              <div className="max-h-60 overflow-y-auto">
                {availableTenants.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    className="p-2 cursor-pointer flex items-center justify-between"
                    onClick={() => handleTenantSwitch(t)}
                  >
                    <div className="flex items-center gap-2">
                      {t.logoUrl ? (
                        <div className="w-6 h-6 rounded overflow-hidden">
                          <img
                            src={t.logoUrl}
                            alt={t.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            backgroundColor: t.primaryColor || "#3b82f6",
                          }}
                        >
                          {t.name.charAt(0)}
                        </div>
                      )}
                      <span className="font-medium">{t.name}</span>
                    </div>
                    {tenant?.id === t.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
            ) : (
              <div className="p-2 text-center text-sm text-slate-500">
                No organizations available
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-slate-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="max-h-80 overflow-y-auto">
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div>
                  <p className="font-medium text-sm">New user registration</p>
                  <p className="text-xs text-slate-500 mt-1">2 minutes ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div>
                  <p className="font-medium text-sm">
                    Widget configuration updated
                  </p>
                  <p className="text-xs text-slate-500 mt-1">1 hour ago</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="p-3 cursor-pointer">
                <div>
                  <p className="font-medium text-sm">System update completed</p>
                  <p className="text-xs text-slate-500 mt-1">Yesterday</p>
                </div>
              </DropdownMenuItem>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="justify-center">
              <Button variant="ghost" size="sm" className="w-full">
                View all notifications
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5 text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Help</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "admin"}`}
                  alt={user?.fullName || "Admin User"}
                  className="w-full h-full object-cover"
                />
              </div>
              <span>{user?.fullName || "Admin User"}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              {user?.fullName || "Admin User"}
            </DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs font-normal text-slate-500">
              {user?.email || "admin@example.com"}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Account Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default AdminHeader;
