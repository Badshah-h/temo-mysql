import React from "react";
import AdminLayout from "../AdminLayout";
import WidgetConfigurator from "../../WidgetConfigurator";

const AdminWidgetConfig: React.FC = () => {
  return (
    <AdminLayout title="Widget Configuration">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Customize Your Chat Widget</h2>
          <p className="text-slate-500">
            Configure the appearance, behavior, and content of your chat widget.
          </p>
        </div>

        <WidgetConfigurator />
      </div>
    </AdminLayout>
  );
};

export default AdminWidgetConfig;
