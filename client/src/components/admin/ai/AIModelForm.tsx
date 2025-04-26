import React, { useState, useEffect } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Save, ArrowLeft, Key } from "lucide-react";
import { AIModelConfig, aiConfigApi } from "@/api/aiConfigApi";

const modelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  provider: z.string().min(1, "Provider is required"),
  model: z.string().min(1, "Model identifier is required"),
  apiKey: z.string().optional(),
  baseUrl: z.string().optional(),
  temperature: z.number().min(0).max(1),
  maxTokens: z.number().int().positive(),
  stopSequences: z.string().optional(),
  systemPrompt: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type ModelFormValues = z.infer<typeof modelSchema>;

interface AIModelFormProps {
  modelId?: number;
  onSaved?: (model: AIModelConfig) => void;
  onCancel?: () => void;
}

const AIModelForm: React.FC<AIModelFormProps> = ({
  modelId,
  onSaved,
  onCancel,
}) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: "",
      provider: "gemini",
      model: "",
      apiKey: "",
      baseUrl: "",
      temperature: 0.7,
      maxTokens: 1024,
      stopSequences: "",
      systemPrompt: "",
      isDefault: false,
    },
  });

  const selectedProvider = watch("provider");
  const temperatureValue = watch("temperature");

  useEffect(() => {
    const fetchModel = async () => {
      if (!modelId || !token) return;

      try {
        setLoading(true);
        const model = await aiConfigApi.getModel(modelId, token);

        reset({
          name: model.name,
          provider: model.provider,
          model: model.model,
          apiKey: model.apiKey || "",
          baseUrl: model.baseUrl || "",
          temperature: model.temperature,
          maxTokens: model.maxTokens,
          stopSequences: model.stopSequences?.join(",") || "",
          systemPrompt: model.systemPrompt || "",
          isDefault: model.isDefault,
        });
      } catch (error) {
        console.error("Error fetching model:", error);
        toast({
          title: "Error",
          description: "Failed to load AI model configuration",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchModel();
  }, [modelId, token, reset, toast]);

  const onSubmit = async (data: ModelFormValues) => {
    try {
      setLoading(true);

      // Process stop sequences from comma-separated string to array
      const stopSequences = data.stopSequences
        ? data.stopSequences.split(",").map((seq) => seq.trim())
        : undefined;

      const modelData = {
        ...data,
        stopSequences,
      };

      let response;

      if (modelId) {
        // Update existing model
        response = await aiConfigApi.updateModel(modelId, modelData, token!);
        toast({
          title: "Success",
          description: "AI model updated successfully",
        });
      } else {
        // Create new model
        response = await aiConfigApi.createModel(modelData, token!);
        toast({
          title: "Success",
          description: "AI model created successfully",
        });
      }

      if (onSaved) {
        onSaved(response);
      }
    } catch (error) {
      console.error("Error saving AI model:", error);
      toast({
        title: "Error",
        description: "Failed to save AI model configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getProviderModels = (provider: string) => {
    switch (provider) {
      case "gemini":
        return [
          { id: "gemini-pro", name: "Gemini Pro" },
          { id: "gemini-pro-vision", name: "Gemini Pro Vision" },
          { id: "gemini-ultra", name: "Gemini Ultra" },
        ];
      case "huggingface":
        return [
          { id: "mistralai/Mistral-7B-Instruct-v0.2", name: "Mistral 7B" },
          { id: "meta-llama/Llama-2-7b-chat-hf", name: "Llama 2 7B" },
          { id: "meta-llama/Llama-2-13b-chat-hf", name: "Llama 2 13B" },
          { id: "meta-llama/Llama-2-70b-chat-hf", name: "Llama 2 70B" },
          { id: "custom", name: "Custom Model" },
        ];
      case "custom":
        return [{ id: "custom", name: "Custom Model" }];
      default:
        return [];
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {modelId ? "Edit AI Model" : "Create New AI Model"}
        </h2>
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">
                  Model Name{" "}
                  {errors.name && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="E.g., Production Gemini"
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="provider">
                  Provider{" "}
                  {errors.provider && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={selectedProvider}
                  onValueChange={(value) => setValue("provider", value)}
                >
                  <SelectTrigger id="provider">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                    <SelectItem value="huggingface">Hugging Face</SelectItem>
                    <SelectItem value="custom">Custom Provider</SelectItem>
                  </SelectContent>
                </Select>
                {errors.provider && (
                  <p className="text-sm text-red-500">
                    {errors.provider.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">
                Model Identifier{" "}
                {errors.model && <span className="text-red-500">*</span>}
              </Label>
              <Select
                value={watch("model")}
                onValueChange={(value) => setValue("model", value)}
              >
                <SelectTrigger id="model">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent>
                  {getProviderModels(selectedProvider).map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {model.name}
                    </SelectItem>
                  ))}
                  {selectedProvider === "huggingface" && (
                    <div className="p-2 border-t">
                      <Input
                        placeholder="Or enter custom model ID"
                        onChange={(e) => setValue("model", e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  )}
                </SelectContent>
              </Select>
              {errors.model && (
                <p className="text-sm text-red-500">{errors.model.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="isDefault">Default Model</Label>
                <p className="text-sm text-muted-foreground">
                  Use this model as the default when no specific routing rules
                  apply
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(checked) => setValue("isDefault", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="apiKey">API Key</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  <Key className="h-4 w-4 mr-1" />
                  {showApiKey ? "Hide" : "Show"}
                </Button>
              </div>
              <Input
                id="apiKey"
                {...register("apiKey")}
                type={showApiKey ? "text" : "password"}
                placeholder={`Enter your ${selectedProvider} API key`}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is encrypted before being stored in the database
              </p>
            </div>

            {(selectedProvider === "huggingface" ||
              selectedProvider === "custom") && (
              <div className="space-y-2">
                <Label htmlFor="baseUrl">Base URL (Optional)</Label>
                <Input
                  id="baseUrl"
                  {...register("baseUrl")}
                  placeholder="https://api.example.com/v1"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the default API endpoint
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Generation Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="temperature">
                    Temperature: {temperatureValue.toFixed(2)}
                  </Label>
                </div>
                <Slider
                  id="temperature"
                  min={0}
                  max={1}
                  step={0.01}
                  value={[temperatureValue]}
                  onValueChange={(value) => setValue("temperature", value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Lower values produce more consistent outputs, higher values
                  produce more creative outputs
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxTokens">
                  Max Tokens{" "}
                  {errors.maxTokens && <span className="text-red-500">*</span>}
                </Label>
                <Input
                  id="maxTokens"
                  type="number"
                  {...register("maxTokens", { valueAsNumber: true })}
                />
                {errors.maxTokens && (
                  <p className="text-sm text-red-500">
                    {errors.maxTokens.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Maximum number of tokens to generate in the response
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stopSequences">
                  Stop Sequences (comma separated)
                </Label>
                <Input
                  id="stopSequences"
                  {...register("stopSequences")}
                  placeholder="###, END, STOP"
                />
                <p className="text-xs text-muted-foreground">
                  Sequences that signal the model to stop generating further
                  tokens
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemPrompt">System Prompt</Label>
                <Textarea
                  id="systemPrompt"
                  {...register("systemPrompt")}
                  placeholder="Instructions to set the behavior of the AI model"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  This prompt will be prepended to all interactions with this
                  model
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={loading}>
            {loading ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {modelId ? "Update" : "Create"} Model
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIModelForm;
