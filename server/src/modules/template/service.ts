import { db } from "../../db";
import { Template } from "../../types";

export const TemplateService = {
  /**
   * Find template by ID
   */
  findById: async (id: number): Promise<Template | null> => {
    try {
      const template = await db("templates")
        .where("id", id)
        .select(
          "id",
          "name",
          "description",
          "content",
          "category",
          "tags",
          "is_global as isGlobal",
          "response_format_id as responseFormatId",
          "usage_count as usageCount",
          "created_by as createdBy",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      return template || null;
    } catch (error) {
      console.error("Error finding template by ID:", error);
      throw error;
    }
  },

  /**
   * Get all templates with filtering and pagination
   */
  findAll: async (params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isGlobal?: boolean;
    createdBy?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    templates: Template[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> => {
    try {
      const {
        page = 1,
        limit = 10,
        search,
        category,
        isGlobal,
        createdBy,
        sortBy = "name",
        sortOrder = "asc",
      } = params;

      const offset = (page - 1) * limit;

      // Build query
      let query = db("templates").select(
        "id",
        "name",
        "description",
        "content",
        "category",
        "tags",
        "is_global as isGlobal",
        "response_format_id as responseFormatId",
        "usage_count as usageCount",
        "created_by as createdBy",
        "created_at as createdAt",
        "updated_at as updatedAt",
      );

      // Apply filters
      if (search) {
        query = query.where((builder) => {
          builder
            .where("name", "like", `%${search}%`)
            .orWhere("description", "like", `%${search}%`);
        });
      }

      if (category) {
        query = query.where("category", category);
      }

      if (isGlobal !== undefined) {
        query = query.where("is_global", isGlobal);
      }

      // Show global templates and user's own templates
      if (createdBy) {
        query = query.where((builder) => {
          builder.where("is_global", true).orWhere("created_by", createdBy);
        });
      }

      // Count total before pagination
      const [{ count }] = await query.clone().count("* as count");

      // Apply sorting and pagination
      const templates = await query
        .orderBy(sortBy, sortOrder)
        .limit(limit)
        .offset(offset);

      return {
        templates,
        pagination: {
          total: Number(count),
          page,
          limit,
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    } catch (error) {
      console.error("Error finding all templates:", error);
      throw error;
    }
  },

  /**
   * Create a new template
   */
  create: async (templateData: {
    name: string;
    description?: string;
    content: string;
    category?: string;
    tags?: string[];
    isGlobal?: boolean;
    responseFormatId?: number;
    createdBy?: number;
  }): Promise<Template> => {
    try {
      const [id] = await db("templates").insert({
        name: templateData.name,
        description: templateData.description,
        content: templateData.content,
        category: templateData.category,
        tags: templateData.tags ? JSON.stringify(templateData.tags) : null,
        is_global: templateData.isGlobal ?? false,
        response_format_id: templateData.responseFormatId,
        usage_count: 0,
        created_by: templateData.createdBy,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return TemplateService.findById(id) as Promise<Template>;
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    }
  },

  /**
   * Update template
   */
  update: async (
    id: number,
    templateData: {
      name?: string;
      description?: string;
      content?: string;
      category?: string;
      tags?: string[];
      isGlobal?: boolean;
      responseFormatId?: number;
    },
  ): Promise<Template | null> => {
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (templateData.name) updateData.name = templateData.name;
      if (templateData.description !== undefined)
        updateData.description = templateData.description;
      if (templateData.content) updateData.content = templateData.content;
      if (templateData.category !== undefined)
        updateData.category = templateData.category;
      if (templateData.tags !== undefined)
        updateData.tags = JSON.stringify(templateData.tags);
      if (templateData.isGlobal !== undefined)
        updateData.is_global = templateData.isGlobal;
      if (templateData.responseFormatId !== undefined)
        updateData.response_format_id = templateData.responseFormatId;

      await db("templates").where("id", id).update(updateData);

      return TemplateService.findById(id);
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  },

  /**
   * Delete template
   */
  delete: async (id: number): Promise<boolean> => {
    try {
      await db("templates").where("id", id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  },

  /**
   * Increment template usage count
   */
  incrementUsageCount: async (id: number): Promise<boolean> => {
    try {
      await db("templates")
        .where("id", id)
        .update({
          usage_count: db.raw("usage_count + 1"),
          updated_at: new Date(),
        });

      return true;
    } catch (error) {
      console.error("Error incrementing usage count:", error);
      return false;
    }
  },

  /**
   * Get all template categories
   */
  getCategories: async (): Promise<string[]> => {
    try {
      const categories = await db("templates")
        .distinct("category")
        .whereNotNull("category");

      return categories.map((c) => c.category);
    } catch (error) {
      console.error("Error getting template categories:", error);
      throw error;
    }
  },
};
