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
      <Route path="/" element={<AdminDashboard />} />

      {/* Tutorials */}
      <Route path="/tutorials" element={<Tutorials />} />
      <Route path="/tutorials/getting-started" element={<GettingStarted />} />
      <Route path="/tutorials/advanced" element={<AdvancedTutorials />} />

      {/* Widget Configuration */}
      <Route path="/widget-config" element={<WidgetConfig />} />

      {/* Context Rules */}
      <Route path="/context-rules" element={<ContextRules />} />
      <Route path="/context-rules/create" element={<CreateContextRule />} />
      <Route path="/context-rules/manage" element={<ManageContextRules />} />
      <Route path="/context-rules/test" element={<TestContextRules />} />

      {/* Prompt Templates */}
      <Route path="/templates" element={<PromptTemplates />} />

      {/* Knowledge Base */}
      <Route path="/knowledge-base" element={<KnowledgeBase />} />

      {/* Embed Code */}
      <Route path="/embed-code" element={<EmbedCode />} />

      {/* AI Logs */}
      <Route path="/logs" element={<AILogs />} />

      {/* Analytics */}
      <Route path="/analytics" element={<Analytics />} />

      {/* Settings */}
      <Route path="/settings" element={<Settings />} />

      {/* User Management */}
      <Route path="/users" element={<UserManagement />} />
      <Route path="/roles" element={<RoleManagement />} />
      <Route path="/permissions" element={<PermissionManagement />} />

      {/* AI Configuration */}
      <Route path="/ai-config" element={<AIConfig />} />

      {/* Tenant Settings */}
      <Route path="/tenant-settings" element={<TenantSettingsPage />} />

      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
};

export default AdminRoutes;
