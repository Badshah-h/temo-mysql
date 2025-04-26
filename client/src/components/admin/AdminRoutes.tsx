import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./dashboard/AdminDashboard";
import AdminTemplates from "./templates/AdminTemplates";
import AdminRoles from "./roles/AdminRoles";
import AdminPermissions from "./permissions/AdminPermissions";
import AdminResponseFormats from "./formats/AdminResponseFormats";
import ResponseFormatForm from "./formats/ResponseFormatForm";
import ResponseFormatDetail from "./formats/ResponseFormatDetail";
import { useAuth } from "@/context/AuthContext";

// Simple Coming Soon fallback with improved styling
const ComingSoon: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[400px] p-8 bg-slate-50 rounded-lg border border-slate-200">
    <div className="text-6xl mb-4">🚧</div>
    <h2 className="text-2xl font-bold mb-2">Coming Soon</h2>
    <p className="text-slate-500 text-center max-w-md">
      This feature is currently under development and will be available soon.
    </p>
  </div>
);

const AdminRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user?.roles?.some((role) => role.name === "admin")) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />

      {/* Templates */}
      <Route path="/templates" element={<AdminTemplates />} />
      <Route path="/templates/new" element={<ComingSoon />} />
      <Route path="/templates/:id" element={<ComingSoon />} />
      <Route path="/templates/edit/:id" element={<ComingSoon />} />

      {/* Roles & Permissions */}
      <Route path="/roles" element={<AdminRoles />} />
      <Route path="/permissions" element={<AdminPermissions />} />

      {/* Response Formats */}
      <Route path="/response-formats" element={<AdminResponseFormats />} />
      <Route path="/response-formats/new" element={<ResponseFormatForm />} />
      <Route
        path="/response-formats/edit/:id"
        element={<ResponseFormatForm />}
      />
      <Route path="/response-formats/:id" element={<ResponseFormatDetail />} />

      {/* Widget Config */}
      <Route path="/widget-config" element={<ComingSoon />} />

      {/* Tutorials */}
      <Route path="/tutorials" element={<ComingSoon />} />
      <Route path="/tutorials/getting-started" element={<ComingSoon />} />
      <Route path="/tutorials/advanced" element={<ComingSoon />} />

      {/* Context Rules */}
      <Route path="/context-rules" element={<ComingSoon />} />
      <Route path="/context-rules/create" element={<ComingSoon />} />
      <Route path="/context-rules/manage" element={<ComingSoon />} />
      <Route path="/context-rules/test" element={<ComingSoon />} />

      {/* Knowledge Base */}
      <Route path="/knowledge-base" element={<ComingSoon />} />

      {/* Embed Code */}
      <Route path="/embed-code" element={<ComingSoon />} />

      {/* Logs & Analytics */}
      <Route path="/logs" element={<ComingSoon />} />
      <Route path="/analytics" element={<ComingSoon />} />

      {/* Settings */}
      <Route path="/settings" element={<ComingSoon />} />

      {/* User Management */}
      <Route path="/users" element={<ComingSoon />} />

      {/* AI Config */}
      <Route path="/ai-config" element={<ComingSoon />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
