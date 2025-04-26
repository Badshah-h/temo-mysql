import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import {
  Plus,
  Settings,
  Zap,
  AlertTriangle,
  ArrowRight,
  Edit,
  Trash2,
} from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{
    id: number;
    type: "model" | "rule" | "fallback";
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);

        // Fetch data from API
        if (activeTab === "models" || activeTab === "") {
          const modelsData = await aiConfigApi.getModels(token);
          setModels(modelsData);
        } else if (activeTab === "rules") {
          const rulesData = await aiConfigApi.getRoutingRules(token);
          setRoutingRules(rulesData);
        } else if (activeTab === "fallbacks") {
          const fallbacksData = await aiConfigApi.getFallbackConfigs(token);
          setFallbacks(fallbacksData);
        }
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
  }, [token, toast, activeTab]);

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
    // Refresh data after save
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);

        if (activeTab === "models") {
          const modelsData = await aiConfigApi.getModels(token);
          setModels(modelsData);
        } else if (activeTab === "rules") {
          const rulesData = await aiConfigApi.getRoutingRules(token);
          setRoutingRules(rulesData);
        } else if (activeTab === "fallbacks") {
          const fallbacksData = await aiConfigApi.getFallbackConfigs(token);
          setFallbacks(fallbacksData);
        }
      } catch (error) {
        console.error("Error refreshing data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  };

  const handleCancel = () => {
    setView("list");
  };

  const handleDeleteClick = (
    id: number,
    type: "model" | "rule" | "fallback",
  ) => {
    setItemToDelete({ id, type });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !token) return;

    try {
      setLoading(true);
      const { id, type } = itemToDelete;

      if (type === "model") {
        await aiConfigApi.deleteModel(id, token);
        setModels(models.filter((model) => model.id !== id));
        toast({
          title: "Success",
          description: "AI model deleted successfully",
        });
      } else if (type === "rule") {
        await aiConfigApi.deleteRoutingRule(id, token);
        setRoutingRules(routingRules.filter((rule) => rule.id !== id));
        toast({
          title: "Success",
          description: "Routing rule deleted successfully",
        });
      } else if (type === "fallback") {
        await aiConfigApi.deleteFallbackConfig(id, token);
        setFallbacks(fallbacks.filter((fallback) => fallback.id !== id));
        toast({
          title: "Success",
          description: "Fallback configuration deleted successfully",
        });
      }
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error);
      toast({
        title: "Error",
        description: `Failed to delete ${itemToDelete.type}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleSetDefaultModel = async (id: number) => {
    try {
      if (!token) return;

      await aiConfigApi.setDefaultModel(id, token);

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

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading AI models...</p>
          </CardContent>
        </Card>
      ) : models.length === 0 ? (
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
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(model.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(model.id, "model")}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Temperature: {model.temperature}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Max Tokens: {model.maxTokens}
                      </p>
                    </div>
                    {!model.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefaultModel(model.id)}
                      >
                        Set as Default
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderRoutingRulesList = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Routing Rules</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" /> Add Rule
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Loading routing rules...</p>
          </CardContent>
        </Card>
      ) : routingRules.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              No routing rules configured yet
            </p>
            <Button onClick={handleCreateNew} className="mt-4">
              <Plus className="mr-2 h-4 w-4" /> Add Your First Rule
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {routingRules.map((rule) => (
            <Card key={rule.id} className={!rule.isActive ? "opacity-70" : ""}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center">
                      {rule.name}
                      {!rule.isActive && (
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
                      onClick={() => handleEdit(rule.id)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteClick(rule.id, "rule")}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm space-y-3">
                  {rule.description && (
                    <p className="text-muted-foreground">{rule.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <div className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                      {rule.condition.type}
                    </div>
                    <div className="bg-green-50 text-green-700 px-2 py-1 rounded text-xs">
                      Priority: {rule.priority}
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-muted-foreground">
                      Target model:{" "}
                      {models.find((m) => m.id === rule.targetModelId)?.name ||
                        `Model #${rule.targetModelId}`}
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

  const renderContent = () => {
    if (view === "list") {
      return (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="rules">Routing Rules</TabsTrigger>
            <TabsTrigger value="fallbacks">Fallback Configurations</TabsTrigger>
          </TabsList>

          <TabsContent value="models">{renderModelsList()}</TabsContent>
          <TabsContent value="rules">{renderRoutingRulesList()}</TabsContent>
          <TabsContent value="fallbacks">{renderFallbacksList()}</TabsContent>
        </Tabs>
      );
    } else if (view === "create") {
      if (activeTab === "models") {
        return <AIModelForm onSaved={handleSaved} onCancel={handleCancel} />;
      } else if (activeTab === "rules") {
        return (
          <AIRoutingRuleForm onSaved={handleSaved} onCancel={handleCancel} />
        );
      } else if (activeTab === "fallbacks") {
        return <AIFallbackForm onSaved={handleSaved} onCancel={handleCancel} />;
      }
    } else if (view === "edit" && selectedItemId) {
      if (activeTab === "models") {
        return (
          <AIModelForm
            modelId={selectedItemId}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        );
      } else if (activeTab === "rules") {
        return (
          <AIRoutingRuleForm
            ruleId={selectedItemId}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        );
      } else if (activeTab === "fallbacks") {
        return (
          <AIFallbackForm
            fallbackId={selectedItemId}
            onSaved={handleSaved}
            onCancel={handleCancel}
          />
        );
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        {renderContent()}

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                {itemToDelete?.type === "model" && " AI model"}
                {itemToDelete?.type === "rule" && " routing rule"}
                {itemToDelete?.type === "fallback" && " fallback configuration"}
                .
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                {loading ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
};

export default AIConfigDashboard;
