import React, { useMemo } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useAuth } from "@/context/AuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title }) => {
  const { tenant } = useAuth();

  // Create CSS variables for tenant branding
  const tenantStyles = useMemo(() => {
    if (!tenant) return {};

    const primaryColor = tenant.primaryColor || "#3b82f6";
    const secondaryColor = tenant.secondaryColor || "#10b981";

    return {
      "--tenant-primary": primaryColor,
      "--tenant-secondary": secondaryColor,
      "--tenant-primary-10": `${primaryColor}1A`, // 10% opacity
      "--tenant-primary-20": `${primaryColor}33`, // 20% opacity
    } as React.CSSProperties;
  }, [tenant]);

  // Apply tenant branding to the layout
  const layoutStyle = useMemo(() => {
    if (!tenant?.primaryColor) return {};

    return {
      backgroundColor: `${tenant.primaryColor}05`, // 5% opacity
    };
  }, [tenant]);

  return (
    <div
      className="flex h-screen bg-slate-50"
      style={{ ...layoutStyle, ...tenantStyles }}
    >
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={title} />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>

        {tenant && (
          <div className="p-2 text-xs text-center text-slate-400 border-t border-slate-200">
            {tenant.name} • Powered by ChatEmbed
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
