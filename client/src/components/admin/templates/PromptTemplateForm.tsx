import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { X, Plus, Save, ArrowLeft } from "lucide-react";
import axios from "axios";
import PromptTemplatePreview from "./PromptTemplatePreview";

const templateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  content: z.string().min(1, "Template content is required"),
  category: z.string().optional(),
  isGlobal: z.boolean().default(false),
  metadata: z.record(z.string(), z.any()).optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface PromptTemplateFormProps {
  templateId?: number;
  onSaved?: (template: any) => void;
  onCancel?: () => void;
}

const PromptTemplateForm: React.FC<PromptTemplateFormProps> = ({
  templateId,
  onSaved,
  onCancel,
}) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const [previewData, setPreviewData] = useState<any>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors },
  } = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      name: "",
      description: "",
      content: "",
      category: "",
      isGlobal: false,
      metadata: {},
    },
  });

  const watchedValues = watch();

  useEffect(() => {
    setPreviewData({
      ...watchedValues,
      tags,
    });
  }, [watchedValues, tags]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/prompt-templates/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setCategories(response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchTemplate = async () => {
    if (!templateId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/prompt-templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const template = response.data.template;

      reset({
        name: template.name,
        description: template.description || "",
        content: template.content,
        category: template.category || "",
        isGlobal: template.isGlobal,
        metadata: template.metadata || {},
      });

      setTags(template.tags || []);
    } catch (error) {
      console.error("Error fetching template:", error);
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchTemplate();
  }, [templateId, token]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const onSubmit = async (data: TemplateFormValues) => {
    try {
      setLoading(true);

      const templateData = {
        ...data,
        tags,
      };

      let response;

      if (templateId) {
        // Update existing template
        response = await axios.put(
          `/api/prompt-templates/${templateId}`,
          templateData,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        toast({
          title: "Success",
          description: "Template updated successfully",
        });
      } else {
        // Create new template
        response = await axios.post("/api/prompt-templates", templateData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        toast({
          title: "Success",
          description: "Template created successfully",
        });
      }

      if (onSaved) {
        onSaved(response.data.template);
      } else {
        navigate("/admin/templates");
      }
    } catch (error) {
      console.error("Error saving template:", error);
      toast({
        title: "Error",
        description: "Failed to save template",
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
      navigate("/admin/templates");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {templateId ? "Edit Template" : "Create New Template"}
        </h2>
        <Button variant="outline" onClick={handleCancel}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>

        <TabsContent value="edit" className="space-y-4 pt-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Name{" "}
                    {errors.name && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Template name"
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    {...register("description")}
                    placeholder="Brief description of this template"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
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
                            {field.value &&
                              !categories.includes(field.value) && (
                                <SelectItem value={field.value}>
                                  {field.value}
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="isGlobal">Visibility</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Controller
                        name="isGlobal"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        )}
                      />
                      <span>
                        {watchedValues.isGlobal ? "Global" : "Private"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={addTag}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Template Content{" "}
                  {errors.content && <span className="text-red-500">*</span>}
                </Label>
                <Textarea
                  id="content"
                  {...register("content")}
                  placeholder="Enter your prompt template with placeholders like {{variable_name}}"
                  className="min-h-[300px] font-mono"
                />
                {errors.content && (
                  <p className="text-sm text-red-500">
                    {errors.content.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Use <code>{{ variable_name }}</code> syntax for placeholders
                  that will be replaced at runtime.
                </p>
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
                    {templateId ? "Update" : "Create"} Template
                  </>
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview" className="pt-4">
          <Card>
            <CardContent className="pt-6">
              <PromptTemplatePreview template={previewData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="pt-4">
          <TemplateFormatTester
            templateId={templateId}
            initialQuery="How can I help you today?"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PromptTemplateForm;
