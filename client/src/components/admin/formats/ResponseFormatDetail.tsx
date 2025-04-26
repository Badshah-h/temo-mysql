import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { ArrowLeft, Edit, Trash2, Copy, FileJson } from "lucide-react";
import { responseFormatApi, ResponseFormat } from "@/api/responseFormatApi";
import ResponseFormatPreview from "./ResponseFormatPreview";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface ResponseFormatDetailProps {
  formatId?: number;
  onBack?: () => void;
  onEdit?: (format: ResponseFormat) => void;
  onDelete?: (format: ResponseFormat) => void;
}

const ResponseFormatDetail: React.FC<ResponseFormatDetailProps> = ({
  formatId: propFormatId,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { id: paramId } = useParams<{ id: string }>();
  const formatId = propFormatId || (paramId ? parseInt(paramId) : undefined);

  const { token } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [format, setFormat] = useState<ResponseFormat | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("preview");
  const [testContent, setTestContent] = useState(
    "This is a sample response that will be formatted according to your template. You can see how your format will look with actual content.",
  );

  const fetchFormat = async () => {
    if (!formatId || !token) return;

    try {
      setLoading(true);
      // In a real implementation, this would call the API
      // const format = await responseFormatApi.getFormat(formatId, token);

      // Mock data for development
      const mockFormat: ResponseFormat = {
        id: formatId,
        name: "Technical Documentation",
        description: "Format for technical explanations with code examples",
        structure: {
          title: "Technical Guide",
          intro: "Technical explanation:",
          content_blocks: [
            {
              type: "text",
              heading: "Overview",
              content: "This is an overview of the technical documentation.",
            },
            {
              type: "code",
              heading: "Code Example",
              content:
                "console.log('Hello world');\n// This is a code example\nfunction example() {\n  return 'This is a sample function';\n}",
            },
            {
              type: "list",
              heading: "Key Features",
              content: ["Feature 1", "Feature 2", "Feature 3"],
            },
          ],
          actions: [
            {
              label: "View Documentation",
              url: "https://example.com/docs",
              type: "link",
              style: "primary",
            },
            {
              label: "Download Example",
              url: "https://example.com/download",
              type: "download",
              style: "outline",
            },
          ],
          disclaimer: "This documentation is provided as-is without warranty.",
        },
        category: "Technical",
        tags: ["code", "documentation", "technical"],
        isGlobal: true,
        usageCount: 87,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        creator: {
          id: 1,
          fullName: "Admin User",
          email: "admin@example.com",
        },
      };

      setFormat(mockFormat);
    } catch (error) {
      console.error("Error fetching format:", error);
      toast({
        title: "Error",
        description: "Failed to load response format",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormat();
  }, [formatId, token]);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate("/admin/response-formats");
    }
  };

  const handleEdit = () => {
    if (format) {
      if (onEdit) {
        onEdit(format);
      } else {
        navigate(`/admin/response-formats/edit/${format.id}`);
      }
    }
  };

  const handleDelete = async () => {
    if (!format) return;

    if (
      !window.confirm(
        `Are you sure you want to delete the format "${format.name}"?`,
      )
    ) {
      return;
    }

    try {
      // In a real implementation, this would call the API
      // await responseFormatApi.deleteFormat(format.id, token);

      toast({
        title: "Success",
        description: "Format deleted successfully",
      });

      if (onDelete) {
        onDelete(format);
      } else {
        navigate("/admin/response-formats");
      }
    } catch (error) {
      console.error("Error deleting format:", error);
      toast({
        title: "Error",
        description: "Failed to delete format",
        variant: "destructive",
      });
    }
  };

  const handleCopyJson = () => {
    if (!format) return;

    const json = JSON.stringify(format.structure, null, 2);
    navigator.clipboard.writeText(json);

    toast({
      title: "Copied",
      description: "Format structure copied to clipboard",
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

  if (!format) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium">Format not found</h3>
        <Button onClick={handleBack} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Formats
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
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{format.name}</CardTitle>
              {format.description && (
                <p className="text-muted-foreground mt-1">
                  {format.description}
                </p>
              )}
            </div>
            {format.isGlobal ? (
              <Badge>Global</Badge>
            ) : (
              <Badge variant="outline">Private</Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Category:</span>
              <div>{format.category || "None"}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Tags:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {format.tags && format.tags.length > 0 ? (
                  format.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))
                ) : (
                  <span>None</span>
                )}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Usage Count:</span>
              <div>{format.usageCount}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>
              <div>
                {format.createdAt ? formatDate(format.createdAt) : "N/A"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Last updated:</span>
              <div>
                {format.updatedAt ? formatDate(format.updatedAt) : "N/A"}
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Created by:</span>
              <div>{format.creator ? format.creator.fullName : "System"}</div>
            </div>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="test">Test Format</TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="border rounded-md p-4 bg-white">
                    <ResponseFormatPreview
                      structure={format.structure}
                      content="This is a sample response that demonstrates how this format template will structure AI-generated content. The format includes various elements like headings, paragraphs, lists, and other components as defined in the template."
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="structure" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Format Structure</h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleCopyJson}
                    >
                      <Copy className="mr-2 h-4 w-4" /> Copy JSON
                    </Button>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-md overflow-auto max-h-[500px]">
                    <pre className="text-sm font-mono">
                      {JSON.stringify(format.structure, null, 2)}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="test" className="pt-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Test Content</Label>
                      <Textarea
                        value={testContent}
                        onChange={(e) => setTestContent(e.target.value)}
                        placeholder="Enter content to see how it would be formatted"
                        rows={6}
                      />
                    </div>

                    <div className="border-t pt-4 mt-4">
                      <h3 className="text-lg font-medium mb-4">
                        Formatted Result
                      </h3>
                      <div className="border rounded-md p-4 bg-white">
                        <ResponseFormatPreview
                          structure={format.structure}
                          content={testContent}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponseFormatDetail;
