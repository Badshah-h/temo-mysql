import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Save } from "lucide-react";
import axios from "axios";

interface Permission {
  id: number;
  name: string;
  description?: string;
  category?: string;
}

interface RolePermissionsProps {
  roleId: number;
}

const RolePermissions: React.FC<RolePermissionsProps> = ({ roleId }) => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [allPermissions, setAllPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  const [permissionsByCategory, setPermissionsByCategory] = useState<
    Record<string, Permission[]>
  >({});
  const [categories, setCategories] = useState<string[]>([]);

  const fetchPermissions = async () => {
    try {
      setLoading(true);

      // Get all permissions
      const allPermsResponse = await axios.get("/api/permissions", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Get role's current permissions
      const rolePermsResponse = await axios.get(
        `/api/roles/${roleId}/permissions`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const permissions = allPermsResponse.data.permissions;
      const rolePermissions = rolePermsResponse.data.permissions;

      setAllPermissions(permissions);

      // Set selected permissions based on role's current permissions
      setSelectedPermissions(rolePermissions.map((p: Permission) => p.id));

      // Group permissions by category
      const byCategory: Record<string, Permission[]> = {};
      const cats: string[] = [];

      permissions.forEach((permission: Permission) => {
        const category = permission.category || "Uncategorized";
        if (!byCategory[category]) {
          byCategory[category] = [];
          cats.push(category);
        }
        byCategory[category].push(permission);
      });

      setPermissionsByCategory(byCategory);
      setCategories(cats.sort());
    } catch (error) {
      console.error("Error fetching permissions:", error);
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (roleId) {
      fetchPermissions();
    }
  }, [roleId, token]);

  const handleTogglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) => {
      if (prev.includes(permissionId)) {
        return prev.filter((id) => id !== permissionId);
      } else {
        return [...prev, permissionId];
      }
    });
  };

  const handleToggleCategory = (category: string, isChecked: boolean) => {
    const categoryPermissionIds = permissionsByCategory[category].map(
      (p) => p.id,
    );

    setSelectedPermissions((prev) => {
      if (isChecked) {
        // Add all permissions from this category that aren't already selected
        const newSelected = [...prev];
        categoryPermissionIds.forEach((id) => {
          if (!newSelected.includes(id)) {
            newSelected.push(id);
          }
        });
        return newSelected;
      } else {
        // Remove all permissions from this category
        return prev.filter((id) => !categoryPermissionIds.includes(id));
      }
    });
  };

  const isCategoryFullySelected = (category: string) => {
    const categoryPermissionIds = permissionsByCategory[category].map(
      (p) => p.id,
    );
    return categoryPermissionIds.every((id) =>
      selectedPermissions.includes(id),
    );
  };

  const isCategoryPartiallySelected = (category: string) => {
    const categoryPermissionIds = permissionsByCategory[category].map(
      (p) => p.id,
    );
    return (
      categoryPermissionIds.some((id) => selectedPermissions.includes(id)) &&
      !categoryPermissionIds.every((id) => selectedPermissions.includes(id))
    );
  };

  const handleSavePermissions = async () => {
    try {
      setSaving(true);

      await axios.post(
        `/api/roles/${roleId}/permissions`,
        { permissionIds: selectedPermissions },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Role Permissions</h3>
        <Button onClick={handleSavePermissions} disabled={saving}>
          <Save className="mr-2 h-4 w-4" />
          {saving ? "Saving..." : "Save Permissions"}
        </Button>
      </div>

      {categories.length === 0 ? (
        <p>No permissions available</p>
      ) : (
        <div className="space-y-4">
          {categories.map((category) => (
            <Card key={category}>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category}`}
                      checked={isCategoryFullySelected(category)}
                      data-state={
                        isCategoryPartiallySelected(category)
                          ? "indeterminate"
                          : undefined
                      }
                      onCheckedChange={(checked) =>
                        handleToggleCategory(category, !!checked)
                      }
                    />
                    <label
                      htmlFor={`category-${category}`}
                      className="text-base font-medium"
                    >
                      {category}
                    </label>
                  </div>

                  <div className="ml-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {permissionsByCategory[category].map((permission) => (
                      <div
                        key={permission.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`permission-${permission.id}`}
                          checked={selectedPermissions.includes(permission.id)}
                          onCheckedChange={() =>
                            handleTogglePermission(permission.id)
                          }
                        />
                        <div>
                          <label
                            htmlFor={`permission-${permission.id}`}
                            className="text-sm font-medium"
                          >
                            {permission.name}
                          </label>
                          {permission.description && (
                            <p className="text-xs text-muted-foreground">
                              {permission.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default RolePermissions;
