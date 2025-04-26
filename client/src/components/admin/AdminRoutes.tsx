import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import AdminTemplates from "./templates/AdminTemplates";
import AdminRoles from "./roles/AdminRoles";
import AdminPermissions from "./permissions/AdminPermissions";
import AdminResponseFormats from "./formats/AdminResponseFormats";
import ResponseFormatForm from "./formats/ResponseFormatForm";
import ResponseFormatDetail from "./formats/ResponseFormatDetail";
import { useAuth } from "@/context/AuthContext";

const AdminRoutes: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  // Check if user is authenticated and has admin role
  if (!isAuthenticated || user?.role !== "admin") {
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
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
