import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart3,
  Settings,
  Users,
  MessageSquare,
  Palette,
  FileText,
  Database,
  Code,
  FileCode2,
  LayoutDashboard,
  BookOpen,
  BrainCircuit,
  LogOut,
  Shield,
  Building,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  isActive: boolean;
  hasSubmenu?: boolean;
  isSubmenuOpen?: boolean;
  onToggleSubmenu?: () => void;
  children?: React.ReactNode;
  requiredPermission?: string;
  requiredRole?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  path,
  isActive,
  hasSubmenu = false,
  isSubmenuOpen = false,
  onToggleSubmenu,
  children,
  requiredPermission,
  requiredRole,
}) => {
  const { hasPermission, hasRole } = useAuth();

  // Check if the user has the required permission or role
  if (
    (requiredPermission && !hasPermission(requiredPermission)) ||
    (requiredRole && !hasRole(requiredRole))
  ) {
    return null;
  }

  return (
    <div className="mb-1">
      <Link
        to={path}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-slate-300 hover:text-white hover:bg-slate-800",
        )}
        onClick={hasSubmenu && onToggleSubmenu ? onToggleSubmenu : undefined}
      >
        <span className="text-slate-400">{icon}</span>
        <span>{label}</span>
        {hasSubmenu && (
          <span className="ml-auto">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${isSubmenuOpen ? "rotate-180" : ""}`}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </span>
        )}
      </Link>
      {hasSubmenu && isSubmenuOpen && (
        <div className="ml-6 mt-1 space-y-1">{children}</div>
      )}
    </div>
  );
};

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const [openSubmenu, setOpenSubmenu] = React.useState<string | null>(null);
  const { user, tenant, logout, isAdmin } = useAuth();

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    logout();
    // No need to navigate - the protected route will redirect to login
  };

  // Define primary and secondary colors based on tenant
  const primaryColor = tenant?.primaryColor || "#3b82f6";
  const secondaryColor = tenant?.secondaryColor || "#10b981";

  // Create CSS variables for tenant branding
  const sidebarStyle = {
    "--tenant-primary": primaryColor,
    "--tenant-secondary": secondaryColor,
    "--tenant-primary-10": `${primaryColor}1A`, // 10% opacity
    "--tenant-primary-20": `${primaryColor}33`, // 20% opacity
  } as React.CSSProperties;

  return (
    <div
      className="w-64 bg-[#111827] text-white h-screen flex flex-col"
      style={sidebarStyle}
    >
      <div
        className="p-4 border-b border-slate-700 flex items-center gap-2"
        style={{ borderColor: `var(--tenant-primary-20)` }}
      >
        {tenant?.logoUrl ? (
          <img src={tenant.logoUrl} alt={tenant.name} className="h-6 w-auto" />
        ) : (
          <MessageSquare className="h-6 w-6" style={{ color: primaryColor }} />
        )}
        <h1 className="text-xl font-bold">{tenant?.name || "ChatAdmin"}</h1>
      </div>

      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || "admin"}`}
              alt="Admin User"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-medium">{user?.fullName || "Admin User"}</p>
            <p className="text-xs text-slate-400">
              {user?.email || "admin@example.com"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <nav className="space-y-1">
          <SidebarItem
            icon={<LayoutDashboard className="h-5 w-5" />}
            label="Dashboard"
            path="/admin"
            isActive={isActive("/admin")}
          />

          <SidebarItem
            icon={<FileText className="h-5 w-5" />}
            label="Tutorials"
            path="/admin/tutorials"
            isActive={isActive("/admin/tutorials")}
            hasSubmenu={true}
            isSubmenuOpen={openSubmenu === "tutorials"}
            onToggleSubmenu={() => toggleSubmenu("tutorials")}
          >
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="Getting Started"
              path="/admin/tutorials/getting-started"
              isActive={isActive("/admin/tutorials/getting-started")}
            />
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="Advanced Usage"
              path="/admin/tutorials/advanced"
              isActive={isActive("/admin/tutorials/advanced")}
            />
          </SidebarItem>

          <SidebarItem
            icon={<Palette className="h-5 w-5" />}
            label="Widget Config"
            path="/admin/widget-config"
            isActive={isActive("/admin/widget-config")}
            requiredPermission="widget:configure"
          />

          <SidebarItem
            icon={<MessageSquare className="h-5 w-5" />}
            label="Context Rules"
            path="/admin/context-rules"
            isActive={isActive("/admin/context-rules")}
            hasSubmenu={true}
            isSubmenuOpen={openSubmenu === "context-rules"}
            onToggleSubmenu={() => toggleSubmenu("context-rules")}
            requiredPermission="context:manage"
          >
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="Create Rule"
              path="/admin/context-rules/create"
              isActive={isActive("/admin/context-rules/create")}
              requiredPermission="context:create"
            />
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="Manage Rules"
              path="/admin/context-rules/manage"
              isActive={isActive("/admin/context-rules/manage")}
              requiredPermission="context:manage"
            />
            <SidebarItem
              icon={<FileText className="h-4 w-4" />}
              label="Test Rules"
              path="/admin/context-rules/test"
              isActive={isActive("/admin/context-rules/test")}
              requiredPermission="context:test"
            />
          </SidebarItem>

          <SidebarItem
            icon={<FileText className="h-5 w-5" />}
            label="Prompt Templates"
            path="/admin/templates"
            isActive={isActive("/admin/templates")}
            requiredPermission="templates:view"
          />

          <SidebarItem
            icon={<BookOpen className="h-5 w-5" />}
            label="Knowledge Base"
            path="/admin/knowledge-base"
            isActive={isActive("/admin/knowledge-base")}
            requiredPermission="kb:manage"
          />

          <SidebarItem
            icon={<Code className="h-5 w-5" />}
            label="Embed Code"
            path="/admin/embed-code"
            isActive={isActive("/admin/embed-code")}
            requiredPermission="embed:generate"
          />

          <SidebarItem
            icon={<FileCode2 className="h-5 w-5" />}
            label="AI Logs"
            path="/admin/logs"
            isActive={isActive("/admin/logs")}
            requiredPermission="logs:view"
          />

          <SidebarItem
            icon={<BarChart3 className="h-5 w-5" />}
            label="Analytics"
            path="/admin/analytics"
            isActive={isActive("/admin/analytics")}
            requiredPermission="analytics:view"
          />

          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            path="/admin/settings"
            isActive={isActive("/admin/settings")}
            requiredPermission="settings:manage"
          />

          <SidebarItem
            icon={<Users className="h-5 w-5" />}
            label="User Management"
            path="/admin/users"
            isActive={isActive("/admin/users")}
            hasSubmenu={true}
            isSubmenuOpen={openSubmenu === "users"}
            onToggleSubmenu={() => toggleSubmenu("users")}
            requiredRole="admin"
          >
            <SidebarItem
              icon={<Users className="h-4 w-4" />}
              label="Users"
              path="/admin/users"
              isActive={isActive("/admin/users")}
              requiredPermission="users:manage"
            />
            <SidebarItem
              icon={<Shield className="h-4 w-4" />}
              label="Roles"
              path="/admin/roles"
              isActive={isActive("/admin/roles")}
              requiredPermission="roles:manage"
            />
            <SidebarItem
              icon={<Shield className="h-4 w-4" />}
              label="Permissions"
              path="/admin/permissions"
              isActive={isActive("/admin/permissions")}
              requiredPermission="permissions:manage"
            />
          </SidebarItem>

          <SidebarItem
            icon={<BrainCircuit className="h-5 w-5" />}
            label="AI Configuration"
            path="/admin/ai-config"
            isActive={isActive("/admin/ai-config")}
            requiredPermission="ai:configure"
          />

          {isAdmin && (
            <SidebarItem
              icon={<Building className="h-5 w-5" />}
              label="Organization Settings"
              path="/admin/tenant-settings"
              isActive={isActive("/admin/tenant-settings")}
              requiredRole="admin"
            />
          )}
        </nav>
      </div>

      <div
        className="p-4 border-t border-slate-700"
        style={{ borderColor: `var(--tenant-primary-20)` }}
      >
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <LogOut className="h-5 w-5 text-slate-400" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;
