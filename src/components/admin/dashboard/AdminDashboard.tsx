import React from "react";
import {
  Users,
  MessageSquare,
  Clock,
  BarChart3,
  Settings,
  MessageCircle,
  Code,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AdminLayout from "../AdminLayout";
import StatsCard from "./StatsCard";
import StatusItem from "./StatusItem";
import QuickActionCard from "./QuickActionCard";

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AdminLayout title="Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard
          title="Total Conversations"
          value={loading ? "" : "1,284"}
          loading={loading}
          icon={<MessageSquare className="h-5 w-5" />}
          trend={{ value: 12, positive: true }}
        />
        <StatsCard
          title="Active Users"
          value={loading ? "" : "342"}
          loading={loading}
          icon={<Users className="h-5 w-5" />}
          trend={{ value: 8, positive: true }}
        />
        <StatsCard
          title="Response Rate"
          value={loading ? "" : "94%"}
          loading={loading}
          icon={<BarChart3 className="h-5 w-5" />}
          trend={{ value: 2, positive: true }}
        />
        <StatsCard
          title="Avg. Response Time"
          value={loading ? "" : "1.2s"}
          loading={loading}
          icon={<Clock className="h-5 w-5" />}
          trend={{ value: 3, positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Quick Actions
              </CardTitle>
              <p className="text-sm text-slate-500">
                Common tasks and shortcuts
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <QuickActionCard
                  icon={<Settings className="h-6 w-6" />}
                  title="Configure Widget"
                  description="Customize appearance and behavior of your chat widget"
                  to="/admin/widget-config"
                />
                <QuickActionCard
                  icon={<MessageCircle className="h-6 w-6" />}
                  title="Edit Context Rules"
                  description="Manage AI response contexts and filtering rules"
                  to="/admin/context-rules"
                />
                <QuickActionCard
                  icon={<Code className="h-6 w-6" />}
                  title="Get Embed Code"
                  description="Generate code to embed the widget on your website"
                  to="/admin/embed-code"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                System Status
              </CardTitle>
              <p className="text-sm text-slate-500">Current system health</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                <StatusItem label="API Status" status="checking" />
                <Separator />
                <StatusItem label="Gemini API" status="checking" />
                <Separator />
                <StatusItem label="Hugging Face API" status="checking" />
                <Separator />
                <StatusItem label="Database" status="checking" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
