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
import { Save, ArrowLeft, Plus, X } from "lucide-react";
import { AIModelConfig, AIRoutingRule, aiConfigApi } from "@/api/aiConfigApi";

const ruleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  conditionType: z.string().min(1, "Condition type is required"),
  conditionValue: z.string().min(1, "Condition value is required"),
  targetModelId: z.number().int().positive("Target model is required"),
  priority: z.number().int().min(1),
  isActive: z.boolean().default(true),
});

type RuleFormValues = z.infer<typeof ruleSchema>;

interface AIRoutingRuleFormProps {
  ruleId?: number;
  onSaved?: (rule: AIRoutingRule) => void;
  onCancel?: () => void;
}

const AIRoutingRuleForm: React.FC<AIRoutingRuleFormProps> = ({
  ruleId,
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
  } = useForm<RuleFormValues>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      name: "",
      description: "",
      conditionType: "keyword",
      conditionValue: "",
      targetModelId: 0,
      priority: 10,
      isActive: true,
    },
  });

  const conditionType = watch("conditionType");

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        setLoading(true);

        // Fetch available AI models
        const modelsData = await aiConfigApi.getModels(token);
        setModels(modelsData);

        // If editing an existing rule, fetch its data
        if (ruleId) {
          const rulesData = await aiConfigApi.getRoutingRules(token);
          const rule = rulesData.find((r: AIRoutingRule) => r.id === ruleId);

          if (rule) {
            let conditionValue = "";
            if (Array.isArray(rule.condition.value)) {
              conditionValue = rule.condition.value.join(",");
            } else if (typeof rule.condition.value === "number") {
              conditionValue = rule.condition.value.toString();
            } else {
              conditionValue = rule.condition.value as string;
            }

            reset({
              name: rule.name,
              description: rule.description || "",
              conditionType: rule.condition.type,
              conditionValue,
              targetModelId: rule.targetModelId,
              priority: rule.priority,
              isActive: rule.isActive,
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
  }, [ruleId, token, reset, toast]);

  const onSubmit = async (data: RuleFormValues) => {
    try {
      setLoading(true);

      // Process condition value based on type
      let conditionValue: string | string[] | number = data.conditionValue;

      if (
        data.conditionType === "keyword" ||
        data.conditionType === "language"
      ) {
        conditionValue = data.conditionValue
          .split(",")
          .map((item) => item.trim());
      } else if (data.conditionType === "length") {
        conditionValue = parseInt(data.conditionValue, 10);
      }

      const ruleData = {
        name: data.name,
        description: data.description,
        condition: {
          type: data.conditionType,
          value: conditionValue,
        },
        targetModelId: data.targetModelId,
        priority: data.priority,
        isActive: data.isActive,
      };

      let response;

      if (ruleId) {
        // Update existing rule
        response = await aiConfigApi.updateRoutingRule(
          ruleId,
          ruleData,
          token!,
        );
        toast({
          title: "Success",
          description: "Routing rule updated successfully",
        });
      } else {
        // Create new rule
        response = await aiConfigApi.createRoutingRule(ruleData, token!);
        toast({
          title: "Success",
          description: "Routing rule created successfully",
        });
      }

      if (onSaved) {
        onSaved(response);
      }
    } catch (error) {
      console.error("Error saving routing rule:", error);
      toast({
        title: "Error",
        description: "Failed to save routing rule",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getConditionValueLabel = () => {
    switch (conditionType) {
      case "keyword":
        return "Keywords (comma separated)";
      case "regex":
        return "Regular Expression Pattern";
      case "category":
        return "Category Name";
      case "length":
        return "Minimum Character Length";
      case "language":
        return "Languages (comma separated)";
      default:
        return "Condition Value";
    }
  };

  const getConditionValuePlaceholder = () => {
    switch (conditionType) {
      case "keyword":
        return "technical, support, help, error";
      case "regex":
        return "^how.*work$";
      case "category":
        return "technical-support";
      case "length":
        return "100";
      case "language":
        return "en, fr, es, de";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {ruleId ? "Edit Routing Rule" : "Create New Routing Rule"}
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
            <CardTitle>Rule Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Rule Name{" "}
                {errors.name && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="E.g., Technical Support Queries"
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
                placeholder="Brief description of when this rule applies"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-sm text-muted-foreground">
                  Enable or disable this routing rule
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
            <CardTitle>Condition Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conditionType">
                Condition Type{" "}
                {errors.conditionType && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Select
                value={conditionType}
                onValueChange={(value) => setValue("conditionType", value)}
              >
                <SelectTrigger id="conditionType">
                  <SelectValue placeholder="Select condition type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keyword">Contains Keywords</SelectItem>
                  <SelectItem value="regex">Matches Regex</SelectItem>
                  <SelectItem value="category">Query Category</SelectItem>
                  <SelectItem value="length">Query Length</SelectItem>
                  <SelectItem value="language">Language Detection</SelectItem>
                </SelectContent>
              </Select>
              {errors.conditionType && (
                <p className="text-sm text-red-500">
                  {errors.conditionType.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="conditionValue">
                {getConditionValueLabel()}{" "}
                {errors.conditionValue && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Input
                id="conditionValue"
                {...register("conditionValue")}
                placeholder={getConditionValuePlaceholder()}
                type={conditionType === "length" ? "number" : "text"}
              />
              {errors.conditionValue && (
                <p className="text-sm text-red-500">
                  {errors.conditionValue.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                {conditionType === "keyword" &&
                  "Enter keywords separated by commas"}
                {conditionType === "regex" &&
                  "Enter a valid regular expression pattern"}
                {conditionType === "length" &&
                  "Enter the minimum character length to trigger this rule"}
                {conditionType === "language" &&
                  "Enter language codes (e.g., en, fr, es) separated by commas"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">
                Priority{" "}
                {errors.priority && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="priority"
                type="number"
                {...register("priority", { valueAsNumber: true })}
                min={1}
              />
              {errors.priority && (
                <p className="text-sm text-red-500">
                  {errors.priority.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Higher priority rules are evaluated first (e.g., 100 is
                evaluated before 10)
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Target Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="targetModelId">
                AI Model{" "}
                {errors.targetModelId && (
                  <span className="text-red-500">*</span>
                )}
              </Label>
              <Select
                value={watch("targetModelId")?.toString()}
                onValueChange={(value) =>
                  setValue("targetModelId", parseInt(value, 10))
                }
              >
                <SelectTrigger id="targetModelId">
                  <SelectValue placeholder="Select target AI model" />
                </SelectTrigger>
                <SelectContent>
                  {models.map((model) => (
                    <SelectItem key={model.id} value={model.id.toString()}>
                      {model.name} ({model.provider} - {model.model})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.targetModelId && (
                <p className="text-sm text-red-500">
                  {errors.targetModelId.message}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                When this rule matches, the query will be routed to this AI
                model
              </p>
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
                {ruleId ? "Update" : "Create"} Rule
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AIRoutingRuleForm;
