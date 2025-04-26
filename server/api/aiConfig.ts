import { Request, Response } from "express";
import { db } from "../lib/db";
import { verifyToken } from "./auth/verify";

// AI Models endpoints
export const getModels = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const models = await db("ai_models")
      .where({ tenant_id: tenantId })
      .orWhere({ is_global: true })
      .select("*");

    return res.status(200).json({
      models: models.map((model) => ({
        id: model.id,
        name: model.name,
        provider: model.provider,
        apiKey: model.api_key ? "[ENCRYPTED]" : undefined,
        baseUrl: model.base_url,
        model: model.model_identifier,
        temperature: model.temperature,
        maxTokens: model.max_tokens,
        stopSequences: model.stop_sequences
          ? JSON.parse(model.stop_sequences)
          : undefined,
        systemPrompt: model.system_prompt,
        isDefault: Boolean(model.is_default),
        createdAt: model.created_at,
        updatedAt: model.updated_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching AI models:", error);
    return res.status(500).json({ error: "Failed to fetch AI models" });
  }
};

export const getModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const model = await db("ai_models")
      .where({ id })
      .andWhere(function () {
        this.where({ tenant_id: tenantId }).orWhere({ is_global: true });
      })
      .first();

    if (!model) {
      return res.status(404).json({ error: "AI model not found" });
    }

    return res.status(200).json({
      model: {
        id: model.id,
        name: model.name,
        provider: model.provider,
        apiKey: model.api_key ? "[ENCRYPTED]" : undefined,
        baseUrl: model.base_url,
        model: model.model_identifier,
        temperature: model.temperature,
        maxTokens: model.max_tokens,
        stopSequences: model.stop_sequences
          ? JSON.parse(model.stop_sequences)
          : undefined,
        systemPrompt: model.system_prompt,
        isDefault: Boolean(model.is_default),
        createdAt: model.created_at,
        updatedAt: model.updated_at,
      },
    });
  } catch (error) {
    console.error("Error fetching AI model:", error);
    return res.status(500).json({ error: "Failed to fetch AI model" });
  }
};

export const createModel = async (req: Request, res: Response) => {
  try {
    const {
      name,
      provider,
      model,
      apiKey,
      baseUrl,
      temperature,
      maxTokens,
      stopSequences,
      systemPrompt,
      isDefault,
    } = req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate required fields
    if (!name || !provider || !model) {
      return res
        .status(400)
        .json({ error: "Name, provider, and model are required" });
    }

    // If setting as default, unset any existing default models for this tenant
    if (isDefault) {
      await db("ai_models")
        .where({ tenant_id: tenantId, is_default: true })
        .update({ is_default: false });
    }

    const [modelId] = await db("ai_models").insert({
      name,
      provider,
      model_identifier: model,
      api_key: apiKey,
      base_url: baseUrl,
      temperature: temperature || 0.7,
      max_tokens: maxTokens || 1024,
      stop_sequences: stopSequences ? JSON.stringify(stopSequences) : null,
      system_prompt: systemPrompt,
      is_default: isDefault || false,
      tenant_id: tenantId,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const createdModel = await db("ai_models").where({ id: modelId }).first();

    return res.status(201).json({
      model: {
        id: createdModel.id,
        name: createdModel.name,
        provider: createdModel.provider,
        apiKey: createdModel.api_key ? "[ENCRYPTED]" : undefined,
        baseUrl: createdModel.base_url,
        model: createdModel.model_identifier,
        temperature: createdModel.temperature,
        maxTokens: createdModel.max_tokens,
        stopSequences: createdModel.stop_sequences
          ? JSON.parse(createdModel.stop_sequences)
          : undefined,
        systemPrompt: createdModel.system_prompt,
        isDefault: Boolean(createdModel.is_default),
        createdAt: createdModel.created_at,
        updatedAt: createdModel.updated_at,
      },
    });
  } catch (error) {
    console.error("Error creating AI model:", error);
    return res.status(500).json({ error: "Failed to create AI model" });
  }
};

export const updateModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      provider,
      model,
      apiKey,
      baseUrl,
      temperature,
      maxTokens,
      stopSequences,
      systemPrompt,
      isDefault,
    } = req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if model exists and belongs to tenant
    const existingModel = await db("ai_models")
      .where({ id })
      .andWhere({ tenant_id: tenantId })
      .first();

    if (!existingModel) {
      return res.status(404).json({
        error: "AI model not found or you don't have permission to update it",
      });
    }

    // If setting as default, unset any existing default models for this tenant
    if (isDefault) {
      await db("ai_models")
        .where({ tenant_id: tenantId, is_default: true })
        .whereNot({ id })
        .update({ is_default: false });
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (provider !== undefined) updateData.provider = provider;
    if (model !== undefined) updateData.model_identifier = model;
    if (apiKey !== undefined) updateData.api_key = apiKey;
    if (baseUrl !== undefined) updateData.base_url = baseUrl;
    if (temperature !== undefined) updateData.temperature = temperature;
    if (maxTokens !== undefined) updateData.max_tokens = maxTokens;
    if (stopSequences !== undefined)
      updateData.stop_sequences = JSON.stringify(stopSequences);
    if (systemPrompt !== undefined) updateData.system_prompt = systemPrompt;
    if (isDefault !== undefined) updateData.is_default = isDefault;

    await db("ai_models").where({ id }).update(updateData);

    const updatedModel = await db("ai_models").where({ id }).first();

    return res.status(200).json({
      model: {
        id: updatedModel.id,
        name: updatedModel.name,
        provider: updatedModel.provider,
        apiKey: updatedModel.api_key ? "[ENCRYPTED]" : undefined,
        baseUrl: updatedModel.base_url,
        model: updatedModel.model_identifier,
        temperature: updatedModel.temperature,
        maxTokens: updatedModel.max_tokens,
        stopSequences: updatedModel.stop_sequences
          ? JSON.parse(updatedModel.stop_sequences)
          : undefined,
        systemPrompt: updatedModel.system_prompt,
        isDefault: Boolean(updatedModel.is_default),
        createdAt: updatedModel.created_at,
        updatedAt: updatedModel.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating AI model:", error);
    return res.status(500).json({ error: "Failed to update AI model" });
  }
};

export const deleteModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if model exists and belongs to tenant
    const existingModel = await db("ai_models")
      .where({ id })
      .andWhere({ tenant_id: tenantId })
      .first();

    if (!existingModel) {
      return res.status(404).json({
        error: "AI model not found or you don't have permission to delete it",
      });
    }

    // Check if model is in use by routing rules
    const rulesUsingModel = await db("ai_routing_rules")
      .where({ target_model_id: id })
      .first();

    if (rulesUsingModel) {
      return res.status(400).json({
        error:
          "Cannot delete model as it is being used by one or more routing rules",
      });
    }

    // Check if model is in use by fallback configs
    const fallbacksUsingModel = await db("ai_fallbacks")
      .where({ alternative_model_id: id })
      .first();

    if (fallbacksUsingModel) {
      return res.status(400).json({
        error:
          "Cannot delete model as it is being used by one or more fallback configurations",
      });
    }

    await db("ai_models").where({ id }).delete();

    return res.status(200).json({ message: "AI model deleted successfully" });
  } catch (error) {
    console.error("Error deleting AI model:", error);
    return res.status(500).json({ error: "Failed to delete AI model" });
  }
};

export const setDefaultModel = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if model exists and belongs to tenant
    const existingModel = await db("ai_models")
      .where({ id })
      .andWhere({ tenant_id: tenantId })
      .first();

    if (!existingModel) {
      return res.status(404).json({
        error: "AI model not found or you don't have permission to update it",
      });
    }

    // Unset any existing default models for this tenant
    await db("ai_models")
      .where({ tenant_id: tenantId, is_default: true })
      .update({ is_default: false });

    // Set the specified model as default
    await db("ai_models")
      .where({ id })
      .update({ is_default: true, updated_at: new Date() });

    return res
      .status(200)
      .json({ message: "Default model updated successfully" });
  } catch (error) {
    console.error("Error setting default model:", error);
    return res.status(500).json({ error: "Failed to set default model" });
  }
};

// AI Routing Rules endpoints
export const getRoutingRules = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const rules = await db("ai_routing_rules")
      .where({ tenant_id: tenantId })
      .orderBy("priority", "desc")
      .select("*");

    return res.status(200).json({
      rules: rules.map((rule) => ({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        condition: {
          type: rule.condition_type,
          value: rule.condition_value ? JSON.parse(rule.condition_value) : null,
        },
        targetModelId: rule.target_model_id,
        priority: rule.priority,
        isActive: Boolean(rule.is_active),
        createdAt: rule.created_at,
        updatedAt: rule.updated_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching routing rules:", error);
    return res.status(500).json({ error: "Failed to fetch routing rules" });
  }
};

export const createRoutingRule = async (req: Request, res: Response) => {
  try {
    const { name, description, condition, targetModelId, priority, isActive } =
      req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate required fields
    if (
      !name ||
      !condition ||
      !condition.type ||
      condition.value === undefined ||
      !targetModelId
    ) {
      return res
        .status(400)
        .json({ error: "Name, condition, and target model are required" });
    }

    // Check if target model exists
    const targetModel = await db("ai_models")
      .where({ id: targetModelId })
      .andWhere(function () {
        this.where({ tenant_id: tenantId }).orWhere({ is_global: true });
      })
      .first();

    if (!targetModel) {
      return res.status(400).json({ error: "Target AI model not found" });
    }

    const [ruleId] = await db("ai_routing_rules").insert({
      name,
      description,
      condition_type: condition.type,
      condition_value: JSON.stringify(condition.value),
      target_model_id: targetModelId,
      priority: priority || 10,
      is_active: isActive !== undefined ? isActive : true,
      tenant_id: tenantId,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const createdRule = await db("ai_routing_rules")
      .where({ id: ruleId })
      .first();

    return res.status(201).json({
      rule: {
        id: createdRule.id,
        name: createdRule.name,
        description: createdRule.description,
        condition: {
          type: createdRule.condition_type,
          value: JSON.parse(createdRule.condition_value),
        },
        targetModelId: createdRule.target_model_id,
        priority: createdRule.priority,
        isActive: Boolean(createdRule.is_active),
        createdAt: createdRule.created_at,
        updatedAt: createdRule.updated_at,
      },
    });
  } catch (error) {
    console.error("Error creating routing rule:", error);
    return res.status(500).json({ error: "Failed to create routing rule" });
  }
};

export const updateRoutingRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, condition, targetModelId, priority, isActive } =
      req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if rule exists and belongs to tenant
    const existingRule = await db("ai_routing_rules")
      .where({ id })
      .andWhere({ tenant_id: tenantId })
      .first();

    if (!existingRule) {
      return res.status(404).json({
        error:
          "Routing rule not found or you don't have permission to update it",
      });
    }

    // If target model is being updated, check if it exists
    if (targetModelId) {
      const targetModel = await db("ai_models")
        .where({ id: targetModelId })
        .andWhere(function () {
          this.where({ tenant_id: tenantId }).orWhere({ is_global: true });
        })
        .first();

      if (!targetModel) {
        return res.status(400).json({ error: "Target AI model not found" });
      }
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (condition && condition.type !== undefined)
      updateData.condition_type = condition.type;
    if (condition && condition.value !== undefined)
      updateData.condition_value = JSON.stringify(condition.value);
    if (targetModelId !== undefined) updateData.target_model_id = targetModelId;
    if (priority !== undefined) updateData.priority = priority;
    if (isActive !== undefined) updateData.is_active = isActive;

    await db("ai_routing_rules").where({ id }).update(updateData);

    const updatedRule = await db("ai_routing_rules").where({ id }).first();

    return res.status(200).json({
      rule: {
        id: updatedRule.id,
        name: updatedRule.name,
        description: updatedRule.description,
        condition: {
          type: updatedRule.condition_type,
          value: JSON.parse(updatedRule.condition_value),
        },
        targetModelId: updatedRule.target_model_id,
        priority: updatedRule.priority,
        isActive: Boolean(updatedRule.is_active),
        createdAt: updatedRule.created_at,
        updatedAt: updatedRule.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating routing rule:", error);
    return res.status(500).json({ error: "Failed to update routing rule" });
  }
};

export const deleteRoutingRule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if rule exists and belongs to tenant
    const existingRule = await db("ai_routing_rules")
      .where({ id })
      .andWhere({ tenant_id: tenantId })
      .first();

    if (!existingRule) {
      return res.status(404).json({
        error:
          "Routing rule not found or you don't have permission to delete it",
      });
    }

    await db("ai_routing_rules").where({ id }).delete();

    return res
      .status(200)
      .json({ message: "Routing rule deleted successfully" });
  } catch (error) {
    console.error("Error deleting routing rule:", error);
    return res.status(500).json({ error: "Failed to delete routing rule" });
  }
};

// AI Fallback Configurations endpoints
export const getFallbackConfigs = async (req: Request, res: Response) => {
  try {
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const fallbacks = await db("ai_fallbacks")
      .where({ tenant_id: tenantId })
      .select("*");

    return res.status(200).json({
      fallbacks: fallbacks.map((fallback) => ({
        id: fallback.id,
        name: fallback.name,
        description: fallback.description,
        triggerCondition: fallback.trigger_condition,
        action: fallback.action,
        alternativeModelId: fallback.alternative_model_id,
        staticResponse: fallback.static_response,
        isActive: Boolean(fallback.is_active),
        createdAt: fallback.created_at,
        updatedAt: fallback.updated_at,
      })),
    });
  } catch (error) {
    console.error("Error fetching fallback configurations:", error);
    return res
      .status(500)
      .json({ error: "Failed to fetch fallback configurations" });
  }
};

export const createFallbackConfig = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      triggerCondition,
      action,
      alternativeModelId,
      staticResponse,
      isActive,
    } = req.body;
    const tenantId = req.user?.tenantId;
    const userId = req.user?.id;

    if (!tenantId || !userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate required fields
    if (!name || !triggerCondition || !action) {
      return res
        .status(400)
        .json({ error: "Name, trigger condition, and action are required" });
    }

    // If action is to use alternative model, check if it exists
    if (action === "use_alternative_model" && alternativeModelId) {
      const alternativeModel = await db("ai_models")
        .where({ id: alternativeModelId })
        .andWhere(function () {
          this.where({ tenant_id: tenantId }).orWhere({ is_global: true });
        })
        .first();

      if (!alternativeModel) {
        return res
          .status(400)
          .json({ error: "Alternative AI model not found" });
      }
    }

    const [fallbackId] = await db("ai_fallbacks").insert({
      name,
      description,
      trigger_condition: triggerCondition,
      action,
      alternative_model_id:
        action === "use_alternative_model" ? alternativeModelId : null,
      static_response: action === "use_static_response" ? staticResponse : null,
      is_active: isActive !== undefined ? isActive : true,
      tenant_id: tenantId,
      created_by: userId,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const createdFallback = await db("ai_fallbacks")
      .where({ id: fallbackId })
      .first();

    return res.status(201).json({
      fallback: {
        id: createdFallback.id,
        name: createdFallback.name,
        description: createdFallback.description,
        triggerCondition: createdFallback.trigger_condition,
        action: createdFallback.action,
        alternativeModelId: createdFallback.alternative_model_id,
        staticResponse: createdFallback.static_response,
        isActive: Boolean(createdFallback.is_active),
        createdAt: createdFallback.created_at,
        updatedAt: createdFallback.updated_at,
      },
    });
  } catch (error) {
    console.error("Error creating fallback configuration:", error);
    return res
      .status(500)
      .json({ error: "Failed to create fallback configuration" });
  }
};

export const updateFallbackConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      triggerCondition,
      action,
      alternativeModelId,
      staticResponse,
      isActive,
    } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if fallback exists and belongs to tenant
    const existingFallback = await db("ai_fallbacks")
      .where({ id })
      .andWhere({ tenant_id: tenantId })
      .first();

    if (!existingFallback) {
      return res.status(404).json({
        error:
          "Fallback configuration not found or you don't have permission to update it",
      });
    }

    // If action is to use alternative model and model ID is provided, check if it exists
    if (action === "use_alternative_model" && alternativeModelId) {
      const alternativeModel = await db("ai_models")
        .where({ id: alternativeModelId })
        .andWhere(function () {
          this.where({ tenant_id: tenantId }).orWhere({ is_global: true });
        })
        .first();

      if (!alternativeModel) {
        return res
          .status(400)
          .json({ error: "Alternative AI model not found" });
      }
    }

    const updateData: any = {
      updated_at: new Date(),
    };

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (triggerCondition !== undefined)
      updateData.trigger_condition = triggerCondition;
    if (action !== undefined) updateData.action = action;

    // Handle model ID and static response based on action
    if (action === "use_alternative_model") {
      updateData.alternative_model_id = alternativeModelId;
      updateData.static_response = null;
    } else if (action === "use_static_response") {
      updateData.alternative_model_id = null;
      updateData.static_response = staticResponse;
    } else if (action === "notify_admin") {
      updateData.alternative_model_id = null;
      updateData.static_response = null;
    }

    if (isActive !== undefined) updateData.is_active = isActive;

    await db("ai_fallbacks").where({ id }).update(updateData);

    const updatedFallback = await db("ai_fallbacks").where({ id }).first();

    return res.status(200).json({
      fallback: {
        id: updatedFallback.id,
        name: updatedFallback.name,
        description: updatedFallback.description,
        triggerCondition: updatedFallback.trigger_condition,
        action: updatedFallback.action,
        alternativeModelId: updatedFallback.alternative_model_id,
        staticResponse: updatedFallback.static_response,
        isActive: Boolean(updatedFallback.is_active),
        createdAt: updatedFallback.created_at,
        updatedAt: updatedFallback.updated_at,
      },
    });
  } catch (error) {
    console.error("Error updating fallback configuration:", error);
    return res
      .status(500)
      .json({ error: "Failed to update fallback configuration" });
  }
};

export const deleteFallbackConfig = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Check if fallback exists and belongs to tenant
    const existingFallback = await db("ai_fallbacks")
      .where({ id })
      .andWhere({ tenant_id: tenantId })
      .first();

    if (!existingFallback) {
      return res.status(404).json({
        error:
          "Fallback configuration not found or you don't have permission to delete it",
      });
    }

    await db("ai_fallbacks").where({ id }).delete();

    return res
      .status(200)
      .json({ message: "Fallback configuration deleted successfully" });
  } catch (error) {
    console.error("Error deleting fallback configuration:", error);
    return res
      .status(500)
      .json({ error: "Failed to delete fallback configuration" });
  }
};

// Test AI Configuration endpoint
export const testAIConfiguration = async (req: Request, res: Response) => {
  try {
    const { query, templateId, formatId, modelId, variables } = req.body;
    const tenantId = req.user?.tenantId;

    if (!tenantId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Validate required fields
    if (!query || !templateId) {
      return res
        .status(400)
        .json({ error: "Query and template ID are required" });
    }

    // Check if template exists and belongs to tenant
    const template = await db("prompt_templates")
      .where({ id: templateId })
      .andWhere(function () {
        this.where({ tenant_id: tenantId }).orWhere({ is_global: true });
      })
      .first();

    if (!template) {
      return res.status(404).json({ error: "Prompt template not found" });
    }

    // If format ID is provided, check if it exists
    let format = null;
    if (formatId) {
      format = await db("response_formats")
        .where({ id: formatId })
        .andWhere(function () {
          this.where({ tenant_id: tenantId }).orWhere({ is_global: true });
        })
        .first();

      if (!format) {
        return res.status(404).json({ error: "Response format not found" });
      }
    }

    // If model ID is provided, check if it exists, otherwise use default model
    let model = null;
    if (modelId) {
      model = await db("ai_models")
        .where({ id: modelId })
        .andWhere(function () {
          this.where({ tenant_id: tenantId }).orWhere({ is_global: true });
        })
        .first();

      if (!model) {
        return res.status(404).json({ error: "AI model not found" });
      }
    } else {
      // Get default model for tenant
      model = await db("ai_models")
        .where({ tenant_id: tenantId, is_default: true })
        .first();

      if (!model) {
        // If no default model for tenant, try to get a global default
        model = await db("ai_models")
          .where({ is_global: true, is_default: true })
          .first();

        if (!model) {
          return res.status(404).json({ error: "No default AI model found" });
        }
      }
    }

    // Process template with variables
    let processedTemplate = template.content;
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
        processedTemplate = processedTemplate.replace(regex, String(value));
      });
    }

    // Replace {{user_query}} with the actual query
    processedTemplate = processedTemplate.replace(
      /{{\s*user_query\s*}}/g,
      query,
    );

    // In a real implementation, you would call the AI service here
    // For this example, we'll simulate a response
    const rawResponse = `This is a simulated AI response to the query: "${query}". The template used was: "${template.name}". The model used was: "${model.name}".`;

    let formattedResponse = rawResponse;
    if (format) {
      // In a real implementation, you would format the response according to the format
      // For this example, we'll create a simple formatted response
      const formatStructure = JSON.parse(format.structure);
      formattedResponse = {
        title: formatStructure.title || "Response",
        intro: formatStructure.intro || "Here's what I found:",
        content_blocks: [
          {
            type: "text",
            heading: "Overview",
            content: rawResponse,
          },
        ],
        actions: formatStructure.actions || [],
      };
    }

    // Update usage statistics
    await db("prompt_templates")
      .where({ id: templateId })
      .increment("usage_count", 1);

    if (formatId) {
      await db("response_formats")
        .where({ id: formatId })
        .increment("usage_count", 1);
    }

    return res.status(200).json({
      content: formattedResponse,
      rawContent: rawResponse,
      formatted: !!format,
      usage: {
        promptTokens: 120, // Simulated token count
        completionTokens: 85, // Simulated token count
        totalTokens: 205, // Simulated token count
      },
    });
  } catch (error) {
    console.error("Error testing AI configuration:", error);
    return res.status(500).json({ error: "Failed to test AI configuration" });
  }
};
