import React, { useState } from "react";
import AdminLayout from "../AdminLayout";
import PermissionsList from "./PermissionsList";
import PermissionForm from "./PermissionForm";

interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

const AdminPermissions: React.FC = () => {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedPermission, setSelectedPermission] =
    useState<Permission | null>(null);

  const handleCreateNew = () => {
    setSelectedPermission(null);
    setView("create");
  };

  const handleEdit = (permission: Permission) => {
    setSelectedPermission(permission);
    setView("edit");
  };

  const handleSaved = () => {
    setView("list");
  };

  const handleCancel = () => {
    setView("list");
  };

  return (
    <AdminLayout title="Permission Management">
      <div className="container mx-auto py-6">
        {view === "list" && (
          <PermissionsList onCreateNew={handleCreateNew} onEdit={handleEdit} />
        )}

        {(view === "create" || view === "edit") && (
          <PermissionForm
            permissionId={selectedPermission?.id}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminPermissions;
