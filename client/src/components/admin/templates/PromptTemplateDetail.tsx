import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Edit, Trash2, Copy } from "lucide-react";
import axios from "axios";
import PromptTemplatePreview from "./PromptTemplatePreview";

interface PromptTemplate {
  id: number;
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  isGlobal: boolean;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: number;
    fullName: string;
    email: string;
  };
}

interface PromptTemplateDetailProps {
  templateId?: number;
  onBack?: () => void;
  onEdit?: (template: PromptTemplate) => void;
  onDelete?: (template: PromptTemplate) => void;
}

const PromptTemplateDetail: React.FC<PromptTemplateDetailProps> = ({
  templateId: propTemplateId,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const templateId =
    propTemplateId || (paramId ? parseInt(paramId) : undefined);

  const { token, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [template, setTemplate] = useState<PromptTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("preview");

  const fetchTemplate = async () => {
    if (!templateId) return;

    try {
      setLoading(true);
      const response = await axios.get(`/api/prompt-templates/${templateId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTemplate(response.data.template);
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
    fetchTemplate();
  }, [templateId, token]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/admin/templates");
    }
  };

  const handleEdit = () => {
    if (template) {
      if (onEdit) {
        onEdit(template);
      } else {
        navigate(`/admin/templates/edit/${template.id}`);
      }
    }
  };

  const handleDelete = async () => {
    if (!template) return;

    if (!window.confirm("Are you sure you want to delete this template?")) {
      return;
    }

    try {
      await axios.delete(`/api/prompt-templates/${template.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast({
        title: "Success",
        description: "Template deleted successfully",
      });

      if (onDelete) {
        onDelete(template);
      } else {
        navigate("/admin/templates");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const handleCopyToClipboard = () => {
    if (!template) return;

    navigator.clipboard.writeText(template.content);
    toast({
      title: "Copied",
      description: "Template content copied to clipboard",
    });
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Template not found</h3>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Templates
        </Button>
      </div>
    );
  }

  const canEdit =
    user && (user.role === "admin" || template.creator?.id === user.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        {canEdit && (
          <div className="space-x-2">
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
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{template.name}</CardTitle>
              {template.description && (
                <p className="text-muted-foreground mt-1">
                  {template.description}
                </p>
              )}
            </div>
            {template.isGlobal ? (
              <Badge className="text-sm">Global</Badge>
            ) : (
              <Badge variant="outline" className="text-sm">
                Private
              </Badge>
            )}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {template.category && (
              <Badge variant="secondary">{template.category}</Badge>
            )}
            {template.tags?.map((tag, index) => (
              <Badge key={index} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Created by:</span>
              <div>{template.creator?.fullName || "Unknown"}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <div>{formatDate(template.createdAt)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Last updated:</span>
              <div>{formatDate(template.updatedAt)}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Usage count:</span>
              <div>{template.usageCount}</div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="raw">Raw Template</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="pt-4">
              <PromptTemplatePreview template={template} />
            </TabsContent>

            <TabsContent value="raw" className="pt-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <pre className="whitespace-pre-wrap font-mono text-sm bg-slate-100 dark:bg-slate-800 p-4 rounded-md overflow-auto max-h-[500px]">
                  {template.content}
                </pre>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PromptTemplateDetail;
