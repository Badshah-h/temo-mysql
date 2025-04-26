import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Edit, Trash2, Users, Shield } from "lucide-react";
import axios from "axios";
import RolePermissions from "./RolePermissions";
import RoleUsers from "./RoleUsers";

interface Role {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  permissions: Array<{
    id: number;
    name: string;
    description?: string;
    category?: string;
  }>;
}

interface RoleDetailProps {
  roleId?: number;
  onBack?: () => void;
  onEdit?: (role: Role) => void;
  onDelete?: (role: Role) => void;
}

const RoleDetail: React.FC<RoleDetailProps> = ({
  roleId: propRoleId,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const roleId = propRoleId || (paramId ? parseInt(paramId) : undefined);

  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("details");

  const fetchRole = async () => {
    if (!roleId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setRole(response.data.role);
    } catch (error) {
      console.error("Error fetching role:", error);
      toast({
        title: "Error",
        description: "Failed to load role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRole();
  }, [roleId, token]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/admin/roles");
    }
  };

  const handleEdit = () => {
    if (role) {
      if (onEdit) {
        onEdit(role);
      } else {
        navigate(`/admin/roles/edit/${role.id}`);
      }
    }
  };

  const handleDelete = async () => {
    if (!role) return;

    // Don't allow deleting built-in roles
    if (["admin", "user", "moderator"].includes(role.name.toLowerCase())) {
      toast({
        title: "Cannot Delete",
        description: "Built-in roles cannot be deleted",
        variant: "destructive",
      });
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to delete the role "${role.name}"?`,
      )
    ) {
      return;
    }

    try {
      await axios.delete(`/api/roles/${role.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Success",
        description: "Role deleted successfully",
      });

      if (onDelete) {
        onDelete(role);
      } else {
        navigate("/admin/roles");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      toast({
        title: "Error",
        description: "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isBuiltInRole = (name: string) => {
    return ["admin", "user", "moderator"].includes(name.toLowerCase());
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Role not found</h3>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Roles
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <div className="space-x-2">
          {!isBuiltInRole(role.name) && (
            <>
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button
                variant="outline"
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{role.name}</CardTitle>
              {role.description && (
                <p className="text-muted-foreground mt-1">{role.description}</p>
              )}
            </div>
            {isBuiltInRole(role.name) ? (
              <Badge className="text-sm">Built-in</Badge>
            ) : (
              <Badge variant="outline" className="text-sm">
                Custom
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created:</span>
              <div>{role.createdAt ? formatDate(role.createdAt) : "N/A"}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Last updated:</span>
              <div>{role.updatedAt ? formatDate(role.updatedAt) : "N/A"}</div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">
                <Shield className="mr-2 h-4 w-4" /> Permissions
              </TabsTrigger>
              <TabsTrigger value="users">
                <Users className="mr-2 h-4 w-4" /> Users
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="pt-4">
              <RolePermissions roleId={role.id} />
            </TabsContent>

            <TabsContent value="users" className="pt-4">
              <RoleUsers roleId={role.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleDetail;
