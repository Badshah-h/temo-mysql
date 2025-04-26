import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Plus, Settings, Zap, AlertTriangle, ArrowRight } from "lucide-react";
import {
  AIModelConfig,
  AIRoutingRule,
  AIFallbackConfig,
  aiConfigApi,
} from "@/api/aiConfigApi";
import AIModelForm from "./AIModelForm";
import AIRoutingRuleForm from "./AIRoutingRuleForm";
import AIFallbackForm from "./AIFallbackForm";
import AdminLayout from "../AdminLayout";

const AIConfigDashboard: React.FC = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("models");
  const [view, setView] = useState<"list" | "create" | "edit">("list");
  const [models, setModels] = useState<AIModelConfig[]>([]);
  const [routingRules, setRoutingRules] = useState<AIRoutingRule[]>([]);
  const [fallbacks, setFallbacks] = useState<AIFallbackConfig[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);

        // In a real implementation, these would be API calls
        // const modelsData = await aiConfigApi.getModels(token);
        // setModels(modelsData);

        // const rulesData = await aiConfigApi.getRoutingRules(token);
        // setRoutingRules(rulesData);

        // const fallbacksData = await aiConfigApi.getFallbackConfigs(token);
        // setFallbacks(fallbacksData);

        // Mock data for development
        setModels([
          {
            id: 1,
            name: "Gemini Pro",
            provider: "gemini",
            model: "gemini-pro",
            temperature: 0.7,
            maxTokens: 1024,
            isDefault: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 2,
            name: "Mistral 7B",
            provider: "huggingface",
            model: "mistralai/Mistral-7B-Instruct-v0.2",
            temperature: 0.5,
            maxTokens: 2048,
            isDefault: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);

        setRoutingRules([
          {
            id: 1,
            name: "Technical Support Queries",
            description: "Route technical questions to Mistral model",
            condition: {
              type: "keyword",
              value: ["error", "bug", "technical", "help"],
            },
            targetModelId: 2,
            priority: 100,
            isActive: true,
          },
          {
            id: 2,
            name: "Long Queries",
            description: "Route long questions to more capable model",
            condition: {
              type: "length",
              value: 200,
            },
            targetModelId: 1,
            priority: 50,
            isActive: true,
          },
        ]);

        setFallbacks([
          {
            id: 1,
            name: "API Error Fallback",
            description: "Handle API errors gracefully",
            triggerCondition: "error",
            action: "use_alternative_model",
            alternativeModelId: 2,
            isActive: true,
          },
          {
            id: 2,
            name: "Content Filter Fallback",
            description: "Handle content policy violations",
            triggerCondition: "content_filter",
            action: "use_static_response",
            staticResponse:
              "I'm sorry, but I cannot provide information on that topic due to content restrictions.",
            isActive: true,
          },
        ]);
      } catch (error) {
        console.error("Error fetching AI configuration data:", error);
        toast({
          title: "Error",
          description: "Failed to load AI configuration data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, toast]);

  const handleCreateNew = () => {
    setSelectedItemId(null);
    setView("create");
  };

  const handleEdit = (id: number) => {
    setSelectedItemId(id);
    setView("edit");
  };

  const handleSaved = () => {
    setView("list");
    // In a real implementation, you would refresh the data here
  };

  const handleCancel = () => {
    setView("list");
  };

  const handleSetDefaultModel = async (id: number) => {
    try {
      // In a real implementation, this would be an API call
      // await aiConfigApi.setDefaultModel(id, token!);

      // Update local state
      setModels(
        models.map((model) => ({
          ...model,
          isDefault: model.id === id,
        })),
      );

      toast({
        title: "Success",
        description: "Default model updated successfully",
      });
    } catch (error) {
      console.error("Error setting default model:", error);
      toast({
        title: "Error",
        description: "Failed to update default model",
        variant: "destructive",
      });
    }
  };

  const renderModelsList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">AI Models</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Model
        </Button>
      </div>

      {models.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No AI models configured yet</p>
            <Button onClick={handleCreateNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add Your First Model
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models.map((model) => (
            <Card
              key={model.id}
              className={model.isDefault ? "border-primary" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {model.name}
                      {model.isDefault && (
                        <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {model.provider} / {model.model}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex items-center">
                    <p className="text-sm text-muted-foreground">
                      Temperature: {model.temperature}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Max Tokens: {model.maxTokens}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderFallbacksList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Fallback Configurations</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Fallback
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              Loading fallback configurations...
            </p>
          </CardContent>
        </Card>
      ) : fallbacks.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No fallback configurations yet
            </p>
            <Button onClick={handleCreateNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add Your First Fallback
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {fallbacks.map((fallback) => (
            <Card
              key={fallback.id}
              className={!fallback.isActive ? "opacity-70" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {fallback.name}
                      {!fallback.isActive && (
                        <span className="ml-2 text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </CardTitle>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(fallback.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(fallback.id, "fallback")}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-3">
                  {fallback.description && (
                    <p className="text-muted-foreground">
                      {fallback.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-amber-50 text-amber-700 px-2 py-1 rounded text-xs">
                      Trigger: {fallback.triggerCondition}
                    </div>
                    <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                      Action: {fallback.action.replace(/_/g, " ")}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      {fallback.action === "use_alternative_model" &&
                        `Alternative model: ${models.find((m) => m.id === fallback.alternativeModelId)?.name || `Model #${fallback.alternativeModelId}`}`}
                      {fallback.action === "use_static_response" &&
                        "Uses static response"}
                      {fallback.action === "notify_admin" && "Notifies admin"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-4">
        <Tabs>
          <TabsList>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="rules">Routing Rules</TabsTrigger>
            <TabsTrigger value="fallbacks">Fallback Configurations</TabsTrigger>
          </TabsList>

          <TabsContent value="models">{renderModelsList()}</TabsContent>

          <TabsContent value="rules">{/* Render routing rules */}</TabsContent>

          <TabsContent value="fallbacks">{renderFallbacksList()}</TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AIConfigDashboard;
