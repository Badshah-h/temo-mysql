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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Save, ArrowLeft } from "lucide-react";
import {
  AIFallbackConfig,
  AIModelConfig,
  aiConfigApi,
} from "@/api/aiConfigApi";

const fallbackSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  triggerCondition: z.string().min(1, "Trigger condition is required"),
  action: z.string().min(1, "Action is required"),
  alternativeModelId: z.number().optional(),
  staticResponse: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FallbackFormValues = z.infer<typeof fallbackSchema>;

interface AIFallbackFormProps {
  fallbackId?: number;
  onSaved?: (fallback: AIFallbackConfig) => void;
  onCancel?: () => void;
}

const AIFallbackForm: React.FC<AIFallbackFormProps> = ({
  fallbackId,
  onSaved,
  onCancel,
}) => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<AIModelConfig[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FallbackFormValues>({
    resolver: zodResolver(fallbackSchema),
    defaultValues: {
      name: "",
      description: "",
      triggerCondition: "error",
      action: "use_alternative_model",
      alternativeModelId: undefined,
      staticResponse: "",
      isActive: true,
    },
  });

  const selectedAction = watch("action");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);

        // Fetch available AI models
        const modelsData = await aiConfigApi.getModels(token);
        setModels(modelsData);

        // If editing an existing fallback, fetch its data
        if (fallbackId) {
          const fallbacksData = await aiConfigApi.getFallbackConfigs(token);
          const fallback = fallbacksData.find(
            (f: AIFallbackConfig) => f.id === fallbackId,
          );

          if (fallback) {
            reset({
              name: fallback.name,
              description: fallback.description || "",
              triggerCondition: fallback.triggerCondition,
              action: fallback.action,
              alternativeModelId: fallback.alternativeModelId,
              staticResponse: fallback.staticResponse || "",
              isActive: fallback.isActive,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Error",
          description: "Failed to load required data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fallbackId, token, reset, toast]);

  const onSubmit = async (data: FallbackFormValues) => {
    try {
      setLoading(true);

      const fallbackData = {
        name: data.name,
        description: data.description,
        triggerCondition: data.triggerCondition,
        action: data.action,
        alternativeModelId:
          data.action === "use_alternative_model"
            ? data.alternativeModelId
            : undefined,
        staticResponse:
          data.action === "use_static_response"
            ? data.staticResponse
            : undefined,
        isActive: data.isActive,
      };

      let response;

      if (fallbackId) {
        // Update existing fallback
        response = await aiConfigApi.updateFallbackConfig(
          fallbackId,
          fallbackData,
          token!,
        );
        toast({
          title: "Success",
          description: "Fallback configuration updated successfully",
        });
      } else {
        // Create new fallback
        response = await aiConfigApi.createFallbackConfig(fallbackData, token!);
        toast({
          title: "Success",
          description: "Fallback configuration created successfully",
        });
      }

      if (onSaved) {
        onSaved(response);
      }
    } catch (error) {
      console.error("Error saving fallback configuration:", error);
      toast({
        title: "Error",
        description: "Failed to save fallback configuration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {fallbackId
            ? "Edit Fallback Configuration"
            : "Create New Fallback Configuration"}
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
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Configuration Name{" "}
                {errors.name && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="E.g., Error Handling Fallback"
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
                placeholder="Brief description of this fallback configuration"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this fallback configuration
                </p>
              </div>
              <Switch
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Fallback Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="triggerCondition">
                Trigger Condition{" "}
                {errors.triggerCondition && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Select
                value={watch("triggerCondition")}
                onValueChange={(value) => setValue("triggerCondition", value)}
              >
                <SelectTrigger id="triggerCondition">
                  <SelectValue placeholder="Select trigger condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">API Error</SelectItem>
                  <SelectItem value="timeout">Request Timeout</SelectItem>
                  <SelectItem value="low_confidence">
                    Low Confidence Score
                  </SelectItem>
                  <SelectItem value="content_filter">
                    Content Filter Triggered
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.triggerCondition && (
                <p className="text-sm text-red-500">
                  {errors.triggerCondition.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                When this condition occurs, the fallback action will be
                triggered
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="action">
                Fallback Action{" "}
                {errors.action && <span className="text-red-500">*</span>}
              </Label>
              <Select
                value={selectedAction}
                onValueChange={(value) => setValue("action", value)}
              >
                <SelectTrigger id="action">
                  <SelectValue placeholder="Select fallback action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="use_alternative_model">
                    Use Alternative Model
                  </SelectItem>
                  <SelectItem value="use_static_response">
                    Use Static Response
                  </SelectItem>
                  <SelectItem value="notify_admin">
                    Notify Admin Only
                  </SelectItem>
                </SelectContent>
              </Select>
              {errors.action && (
                <p className="text-sm text-red-500">{errors.action.message}</p>
              )}
            </div>

            {selectedAction === "use_alternative_model" && (
              <div className="space-y-2">
                <Label htmlFor="alternativeModelId">
                  Alternative Model{" "}
                  {errors.alternativeModelId && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Select
                  value={watch("alternativeModelId")?.toString()}
                  onValueChange={(value) =>
                    setValue("alternativeModelId", parseInt(value, 10))
                  }
                >
                  <SelectTrigger id="alternativeModelId">
                    <SelectValue placeholder="Select alternative AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id.toString()}>
                        {model.name} ({model.provider} - {model.model})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.alternativeModelId && (
                  <p className="text-sm text-red-500">
                    {errors.alternativeModelId.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This model will be used as a fallback when the primary model
                  fails
                </p>
              </div>
            )}

            {selectedAction === "use_static_response" && (
              <div className="space-y-2">
                <Label htmlFor="staticResponse">
                  Static Response{" "}
                  {errors.staticResponse && (
                    <span className="text-red-500">*</span>
                  )}
                </Label>
                <Textarea
                  id="staticResponse"
                  {...register("staticResponse")}
                  placeholder="Enter the static response to show when the fallback is triggered"
                  rows={4}
                />
                {errors.staticResponse && (
                  <p className="text-sm text-red-500">
                    {errors.staticResponse.message}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  This text will be shown to the user when the fallback is
                  triggered
                </p>
              </div>
            )}

            {selectedAction === "notify_admin" && (
              <div className="p-4 bg-slate-50 rounded-md border border-slate-200">
                <p className="text-sm">
                  When this fallback is triggered, an alert will be sent to the
                  admin dashboard and logged in the system. The user will
                  receive a generic error message.
                </p>
              </div>
            )}
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
                {fallbackId ? "Update" : "Create"} Fallback
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIFallbackForm;
