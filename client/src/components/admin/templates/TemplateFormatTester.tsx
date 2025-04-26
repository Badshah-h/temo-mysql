import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Play, Plus, X } from "lucide-react";
import axios from "axios";
import ResponseFormatPreview from "../formats/ResponseFormatPreview";

interface TemplateFormatTesterProps {
  templateId?: number;
  formatId?: number;
  initialQuery?: string;
}

interface Variable {
  name: string;
  value: string;
}

const TemplateFormatTester: React.FC<TemplateFormatTesterProps> = ({
  templateId,
  formatId,
  initialQuery = "",
}) => {
  const { token } = useAuth();
  const { toast } = useToast();

  const [query, setQuery] = useState(initialQuery);
  const [variables, setVariables] = useState<Variable[]>([]);
  const [newVarName, setNewVarName] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<
    number | undefined
  >(templateId);
  const [selectedFormatId, setSelectedFormatId] = useState<number | undefined>(
    formatId,
  );
  const [templates, setTemplates] = useState<any[]>([]);
  const [formats, setFormats] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("setup");

  // Fetch templates and formats on component mount
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // In a real implementation, these would be API calls
        // const templatesResponse = await axios.get("/api/prompt-templates", {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setTemplates(templatesResponse.data.templates);

        // const formatsResponse = await axios.get("/api/response-formats", {
        //   headers: { Authorization: `Bearer ${token}` },
        // });
        // setFormats(formatsResponse.data.formats);

        // Mock data for development
        setTemplates([
          { id: 1, name: "General Query Template" },
          { id: 2, name: "Technical Support Template" },
          { id: 3, name: "Product Information Template" },
        ]);

        setFormats([
          { id: 1, name: "Standard Response" },
          { id: 2, name: "Technical Documentation" },
          { id: 3, name: "FAQ Format" },
        ]);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load templates and formats",
          variant: "destructive",
        });
      }
    };

    fetchData();
  }, [token]);

  const addVariable = () => {
    if (newVarName.trim()) {
      setVariables([...variables, { name: newVarName.trim(), value: "" }]);
      setNewVarName("");
    }
  };

  const removeVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index));
  };

  const updateVariableValue = (index: number, value: string) => {
    const updatedVars = [...variables];
    updatedVars[index].value = value;
    setVariables(updatedVars);
  };

  const handleTest = async () => {
    if (!selectedTemplateId) {
      toast({
        title: "Error",
        description: "Please select a template",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Prepare variables object
      const variablesObj = variables.reduce(
        (acc, v) => {
          acc[v.name] = v.value;
          return acc;
        },
        {} as Record<string, string>,
      );

      // In a real implementation, this would be an API call
      // const response = await axios.post(
      //   "/api/ai/test",
      //   {
      //     templateId: selectedTemplateId,
      //     formatId: selectedFormatId,
      //     query,
      //     variables: variablesObj,
      //   },
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );
      // setResult(response.data);

      // Mock response for development
      setTimeout(() => {
        setResult({
          content: {
            title: "Response to your query",
            intro: "Here's what I found about your question:",
            content_blocks: [
              {
                type: "text",
                heading: "Overview",
                content:
                  query ||
                  "This is a sample response to demonstrate the format.",
              },
              {
                type: "list",
                heading: "Key Points",
                content: [
                  "First important point about the query",
                  "Second relevant information",
                  "Additional context that might be helpful",
                ],
              },
            ],
            actions: [
              {
                label: "Learn More",
                type: "link",
                url: "#",
                style: "primary",
              },
            ],
          },
          rawContent:
            "Raw unformatted response from the AI model would appear here.",
          formatted: true,
          usage: {
            promptTokens: 120,
            completionTokens: 85,
            totalTokens: 205,
          },
        });
        setActiveTab("result");
        setLoading(false);
      }, 1500);

      toast({
        title: "Success",
        description: "Test completed successfully",
      });
    } catch (error) {
      console.error("Error testing template:", error);
      toast({
        title: "Error",
        description: "Failed to test template",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="result" disabled={!result}>
            Result
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prompt Template</Label>
                  <Select
                    value={selectedTemplateId?.toString()}
                    onValueChange={(value) =>
                      setSelectedTemplateId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem
                          key={template.id}
                          value={template.id.toString()}
                        >
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Response Format (Optional)</Label>
                  <Select
                    value={selectedFormatId?.toString()}
                    onValueChange={(value) =>
                      setSelectedFormatId(parseInt(value))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">None (Raw Response)</SelectItem>
                      {formats.map((format) => (
                        <SelectItem
                          key={format.id}
                          value={format.id.toString()}
                        >
                          {format.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="query">Test Query</Label>
                <Textarea
                  id="query"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter a sample user query to test with"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Template Variables</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newVarName}
                      onChange={(e) => setNewVarName(e.target.value)}
                      placeholder="Variable name"
                      className="w-40"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addVariable();
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addVariable}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {variables.length > 0 ? (
                  <div className="space-y-3">
                    {variables.map((variable, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="min-w-20 text-center"
                        >
                          {variable.name}
                        </Badge>
                        <Input
                          value={variable.value}
                          onChange={(e) =>
                            updateVariableValue(index, e.target.value)
                          }
                          placeholder={`Value for ${variable.name}`}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeVariable(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm border border-dashed rounded-md">
                    No variables added yet. Add variables that will be injected
                    into the template.
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleTest}
                  disabled={loading || !selectedTemplateId}
                  className="w-full"
                >
                  <Play className="mr-2 h-4 w-4" />
                  {loading ? "Processing..." : "Test Template"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="result" className="space-y-4 pt-4">
          {result && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Formatted Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 bg-white">
                    <ResponseFormatPreview
                      structure={result.content}
                      content={query}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Raw Response</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-md p-4 bg-slate-50 font-mono text-sm whitespace-pre-wrap">
                    {result.rawContent}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="border rounded-md p-4 text-center">
                      <div className="text-2xl font-bold">
                        {result.usage.promptTokens}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Prompt Tokens
                      </div>
                    </div>
                    <div className="border rounded-md p-4 text-center">
                      <div className="text-2xl font-bold">
                        {result.usage.completionTokens}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completion Tokens
                      </div>
                    </div>
                    <div className="border rounded-md p-4 text-center">
                      <div className="text-2xl font-bold">
                        {result.usage.totalTokens}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total Tokens
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setActiveTab("setup")}>
                  Back to Setup
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateFormatTester;
