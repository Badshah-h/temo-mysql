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

// Simple Coming Soon fallback
const ComingSoon: React.FC = () => (
  <div style={{ padding: 40, textAlign: 'center', fontSize: 24 }}>
    🚧 Coming Soon 🚧
  </div>
);

const AdminRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

    if (
      !isAuthenticated ||
      !user?.roles?.some((role) => role.name === "admin")
    ) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/templates" element={<AdminTemplates />} />
      <Route path="/roles" element={<AdminRoles />} />
      <Route path="/permissions" element={<AdminPermissions />} />
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
      {/* Knowledge Base, Embed Code, AI Logs, Analytics, Settings, User Management, AI Config */}
      <Route path="/knowledge-base" element={<ComingSoon />} />
      <Route path="/embed-code" element={<ComingSoon />} />
      <Route path="/logs" element={<ComingSoon />} />
      <Route path="/analytics" element={<ComingSoon />} />
      <Route path="/settings" element={<ComingSoon />} />
      <Route path="/users" element={<ComingSoon />} />
      <Route path="/roles" element={<AdminRoles />} />
      <Route path="/permissions" element={<AdminPermissions />} />
      <Route path="/ai-config" element={<ComingSoon />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
