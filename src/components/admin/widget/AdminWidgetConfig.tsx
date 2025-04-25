import React from "react";
import AdminLayout from "../AdminLayout";
import WidgetConfigurator from "@/components/WidgetConfigurator";

const AdminWidgetConfig: React.FC = () => {
  return (
    <AdminLayout title="Widget Configuration">
      <WidgetConfigurator />
    </AdminLayout>
  );
};

export default AdminWidgetConfig;
