import React, { useState } from "react";
import AdminLayout from "../AdminLayout";
import RolesList from "./RolesList";
import RoleForm from "./RoleForm";
import RoleDetail from "./RoleDetail";

interface Role {
  id: number;
  name: string;
  description?: string;
  permissionCount: number;
  userCount?: number;
}

const AdminRoles: React.FC = () => {
  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list",
  );
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const handleCreateNew = () => {
    setSelectedRole(null);
    setView("create");
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setView("edit");
  };

  const handleView = (role: Role) => {
    setSelectedRole(role);
    setView("detail");
  };

  const handleSaved = () => {
    setView("list");
  };

  const handleBack = () => {
    setView("list");
  };

  return (
    <AdminLayout title="Role Management">
      <div className="container mx-auto py-6">
        {view === "list" && (
          <RolesList
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onView={handleView}
          />
        )}

        {view === "create" && (
          <RoleForm onSaved={handleSaved} onCancel={handleBack} />
        )}

        {view === "edit" && selectedRole && (
          <RoleForm
            roleId={selectedRole.id}
            onSaved={handleSaved}
            onCancel={handleBack}
          />
        )}

        {view === "detail" && selectedRole && (
          <RoleDetail
            roleId={selectedRole.id}
            onBack={handleBack}
            onEdit={handleEdit}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRoles;
