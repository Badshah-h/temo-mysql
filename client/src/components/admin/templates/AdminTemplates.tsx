import React, { useState } from "react";
import AdminLayout from "../AdminLayout";
import PromptTemplateList from "./PromptTemplateList";
import PromptTemplateForm from "./PromptTemplateForm";

interface PromptTemplate {
  id: number;
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  isGlobal: boolean;
  usageCount: number;
  createdAt: string;
  creator?: {
    id: number;
    fullName: string;
    email: string;
  };
}

const AdminTemplates: React.FC = () => {
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [selectedTemplate, setSelectedTemplate] =
    useState<PromptTemplate | null>(null);

  const handleCreateNew = () => {
    setSelectedTemplate(null);
    setView("create");
  };

  const handleEdit = (template: PromptTemplate) => {
    setSelectedTemplate(template);
    setView("edit");
  };

  const handleSaved = () => {
    setView("list");
  };

  const handleCancel = () => {
    setView("list");
  };

  return (
    <AdminLayout title="Prompt Templates">
      <div className="container mx-auto py-6">
        {view === "list" && (
          <PromptTemplateList
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
          />
        )}

        {(view === "create" || view === "edit") && (
          <PromptTemplateForm
            templateId={selectedTemplate?.id}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminTemplates;
