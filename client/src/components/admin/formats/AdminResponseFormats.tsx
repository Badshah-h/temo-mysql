import React, { useState } from "react";
import AdminLayout from "../AdminLayout";
import ResponseFormatList from "./ResponseFormatList";
import ResponseFormatForm from "./ResponseFormatForm";
import ResponseFormatDetail from "./ResponseFormatDetail";
import { ResponseFormat } from "@/api/responseFormatApi";

const AdminResponseFormats: React.FC = () => {
  const [view, setView] = useState<"list" | "create" | "edit" | "detail">(
    "list",
  );
  const [selectedFormat, setSelectedFormat] = useState<ResponseFormat | null>(
    null,
  );

  const handleCreateNew = () => {
    setSelectedFormat(null);
    setView("create");
  };

  const handleEdit = (format: ResponseFormat) => {
    setSelectedFormat(format);
    setView("edit");
  };

  const handleView = (format: ResponseFormat) => {
    setSelectedFormat(format);
    setView("detail");
  };

  const handleSaved = () => {
    setView("list");
  };

  const handleBack = () => {
    setView("list");
  };

  return (
    <AdminLayout title="Response Format Management">
      <div className="container mx-auto py-6">
        {view === "list" && (
          <ResponseFormatList
            onCreateNew={handleCreateNew}
            onEdit={handleEdit}
            onView={handleView}
          />
        )}

        {view === "create" && (
          <ResponseFormatForm onSaved={handleSaved} onCancel={handleBack} />
        )}

        {view === "edit" && selectedFormat && (
          <ResponseFormatForm
            formatId={selectedFormat.id}
            onSaved={handleSaved}
            onCancel={handleBack}
          />
        )}

        {view === "detail" && selectedFormat && (
          <ResponseFormatDetail
            formatId={selectedFormat.id}
            onBack={handleBack}
            onEdit={() => handleEdit(selectedFormat)}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminResponseFormats;
