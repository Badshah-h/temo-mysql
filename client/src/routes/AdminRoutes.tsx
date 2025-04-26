import { Routes, Route, Navigate } from "react-router-dom";
import AdminDashboard from "./admin/AdminDashboard";
import WidgetConfig from "./admin/WidgetConfig";
import ContextRules from "./admin/ContextRules";
import CreateContextRule from "./admin/CreateContextRule";
import ManageContextRules from "./admin/ManageContextRules";
import TestContextRules from "./admin/TestContextRules";
import PromptTemplates from "./admin/PromptTemplates";
import KnowledgeBase from "./admin/KnowledgeBase";
import EmbedCode from "./admin/EmbedCode";
import AILogs from "./admin/AILogs";
import Analytics from "./admin/Analytics";
import Settings from "./admin/Settings";
import UserManagement from "./admin/UserManagement";
import RoleManagement from "./admin/RoleManagement";
import PermissionManagement from "./admin/PermissionManagement";
import AIConfig from "./admin/AIConfig";
import Tutorials from "./admin/Tutorials";
import GettingStarted from "./admin/GettingStarted";
import AdvancedTutorials from "./admin/AdvancedTutorials";
import TenantSettingsPage from "./admin/TenantSettingsPage";
import ComingSoon from "@/components/admin/ComingSoon";

const AdminRoutes = () => {
  return (
    <Routes>
      {/* Dashboard */}
      <Route
        path="/"
        element={
          <ComingSoon
            title="Admin Dashboard"
            description="The admin dashboard is under development."
          />
        }
      />

      {/* Tutorials */}
      <Route path="/tutorials" element={<ComingSoon title="Tutorials" />} />
      <Route
        path="/tutorials/getting-started"
        element={<ComingSoon title="Getting Started" />}
      />
      <Route
        path="/tutorials/advanced"
        element={<ComingSoon title="Advanced Tutorials" />}
      />

      {/* Widget Configuration */}
      <Route
        path="/widget-config"
        element={<ComingSoon title="Widget Configuration" />}
      />

      {/* Context Rules */}
      <Route
        path="/context-rules"
        element={<ComingSoon title="Context Rules" />}
      />
      <Route
        path="/context-rules/create"
        element={<ComingSoon title="Create Context Rule" />}
      />
      <Route
        path="/context-rules/manage"
        element={<ComingSoon title="Manage Context Rules" />}
      />
      <Route
        path="/context-rules/test"
        element={<ComingSoon title="Test Context Rules" />}
      />

      {/* Prompt Templates */}
      <Route
        path="/templates"
        element={<ComingSoon title="Prompt Templates" />}
      />

      {/* Knowledge Base */}
      <Route
        path="/knowledge-base"
        element={<ComingSoon title="Knowledge Base" />}
      />

      {/* Embed Code */}
      <Route path="/embed-code" element={<ComingSoon title="Embed Code" />} />

      {/* AI Logs */}
      <Route path="/logs" element={<ComingSoon title="AI Logs" />} />

      {/* Analytics */}
      <Route path="/analytics" element={<ComingSoon title="Analytics" />} />

      {/* Settings */}
      <Route path="/settings" element={<ComingSoon title="Settings" />} />

      {/* User Management */}
      <Route path="/users" element={<ComingSoon title="User Management" />} />
      <Route path="/roles" element={<ComingSoon title="Role Management" />} />
      <Route
        path="/permissions"
        element={<ComingSoon title="Permission Management" />}
      />

      {/* AI Configuration */}
      <Route path="/ai-config" element={<AIConfigDashboard />} />

      {/* Tenant Settings */}
      <Route path="/tenant-settings" element={<TenantSettingsPage />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
