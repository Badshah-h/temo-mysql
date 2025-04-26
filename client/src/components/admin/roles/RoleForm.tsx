import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  roleId?: number;
  onSaved?: (role: any) => void;
  onCancel?: () => void;
}

const RoleForm: React.FC<RoleFormProps> = ({ roleId, onSaved, onCancel }) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isBuiltIn, setIsBuiltIn] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const fetchRole = async () => {
    if (!roleId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const role = response.data.role;

      // Check if this is a built-in role
      const builtInRoles = ["admin", "user", "moderator"];
      if (builtInRoles.includes(role.name.toLowerCase())) {
        setIsBuiltIn(true);
        toast({
          title: "Built-in Role",
          description:
            "This is a built-in role. Some fields cannot be modified.",
          variant: "default",
        });
      }

      reset({
        name: role.name,
        description: role.description || "",
      });
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

  const onSubmit = async (data: RoleFormValues) => {
    try {
      setLoading(true);

      let response;

      if (roleId) {
        // Update existing role
        response = await axios.put(`/api/roles/${roleId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      } else {
        // Create new role
        response = await axios.post("/api/roles", data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast({
          title: "Success",
          description: "Role created successfully",
        });
      }

      if (onSaved) {
        onSaved(response.data.role);
      } else {
        navigate("/admin/roles");
      }
    } catch (error) {
      console.error("Error saving role:", error);
      toast({
        title: "Error",
        description: "Failed to save role",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate("/admin/roles");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {roleId ? "Edit Role" : "Create New Role"}
        </h2>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Name {errors.name && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Role name"
                  disabled={isBuiltIn}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
                {isBuiltIn && (
                  <p className="text-sm text-muted-foreground">
                    Built-in role names cannot be changed
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of this role"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || isBuiltIn}>
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {roleId ? "Update" : "Create"} Role
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleForm;
