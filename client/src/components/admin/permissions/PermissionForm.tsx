import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Save } from "lucide-react";
import axios from "axios";

const permissionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
});

type PermissionFormValues = z.infer<typeof permissionSchema>;

interface PermissionFormProps {
  permissionId?: number;
  onSaved?: (permission: any) => void;
  onCancel?: () => void;
}

const PermissionForm: React.FC<PermissionFormProps> = ({
  permissionId,
  onSaved,
  onCancel,
}) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PermissionFormValues>({
    resolver: zodResolver(permissionSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
    },
  });

  const selectedCategory = watch("category");

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/permissions/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPermission = async () => {
    if (!permissionId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/permissions/${permissionId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const permission = response.data.permission;

      reset({
        name: permission.name,
        description: permission.description || "",
        category: permission.category || "",
      });
    } catch (error) {
      console.error("Error fetching permission:", error);
      toast({
        title: "Error",
        description: "Failed to load permission",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchPermission();
  }, [permissionId, token]);

  const onSubmit = async (data: PermissionFormValues) => {
    try {
      setLoading(true);

      let response;

      if (permissionId) {
        // Update existing permission
        response = await axios.put(`/api/permissions/${permissionId}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast({
          title: "Success",
          description: "Permission updated successfully",
        });
      } else {
        // Create new permission
        response = await axios.post("/api/permissions", data, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast({
          title: "Success",
          description: "Permission created successfully",
        });
      }

      if (onSaved) {
        onSaved(response.data.permission);
      } else {
        navigate("/admin/permissions");
      }
    } catch (error) {
      console.error("Error saving permission:", error);
      toast({
        title: "Error",
        description: "Failed to save permission",
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
      navigate("/admin/permissions");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {permissionId ? "Edit Permission" : "Create New Permission"}
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
                  placeholder="Permission name (e.g., users.create)"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Brief description of this permission"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={selectedCategory}
                  onValueChange={(value) => setValue("category", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    {/* Allow custom category */}
                    <div className="p-2 border-t">
                      <Input
                        placeholder="Or enter a new category"
                        onChange={(e) => setValue("category", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </SelectContent>
                </Select>
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
              <Button type="submit" disabled={loading}>
                {loading ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {permissionId ? "Update" : "Create"} Permission
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

export default PermissionForm;
