import React from "react";
import AdminLayout from "../AdminLayout";
import EmbedCodeGenerator from "@/components/EmbedCodeGenerator";

const AdminEmbedCode: React.FC = () => {
  return (
    <AdminLayout title="Embed Code Generator">
      <div className="max-w-4xl mx-auto">
        <EmbedCodeGenerator widgetId="your-widget-id" />
      </div>
    </AdminLayout>
  );
};

export default AdminEmbedCode;
