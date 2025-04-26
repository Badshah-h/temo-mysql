import { db } from "../db";
import { ResponseFormat } from "../types";

export class ResponseFormatModel {
  /**
   * Find response format by ID
   */
  static async findById(id: number): Promise<ResponseFormat | null> {
    try {
      const format = await db("response_formats")
        .where("id", id)
        .select(
          "id",
          "name",
          "description",
          "structure",
          "category",
          "tags",
          "is_global as isGlobal",
          "usage_count as usageCount",
          "created_by as createdBy",
          "created_at as createdAt",
          "updated_at as updatedAt",
        )
        .first();

      return format || null;
    } catch (error) {
      console.error("Error finding response format by ID:", error);
      throw error;
    }
  }

  /**
   * Get all response formats with filtering and pagination
   */
  static async findAll(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    isGlobal?: boolean;
    createdBy?: number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }): Promise<{
    formats: ResponseFormat[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
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
      let query = db("response_formats").select(
        "id",
        "name",
        "description",
        "structure",
        "category",
        "tags",
        "is_global as isGlobal",
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

      if (createdBy) {
        query = query.where("created_by", createdBy);
      }

      // Count total before pagination
      const [{ count }] = await query.clone().count("* as count");

      // Apply sorting and pagination
      const formats = await query
        .orderBy(sortBy, sortOrder)
        .limit(limit)
        .offset(offset);

      return {
        formats,
        pagination: {
          total: Number(count),
          page,
          limit,
          totalPages: Math.ceil(Number(count) / limit),
        },
      };
    } catch (error) {
      console.error("Error finding all response formats:", error);
      throw error;
    }
  }

  /**
   * Create a new response format
   */
  static async create(formatData: {
    name: string;
    description?: string;
    structure: object;
    category?: string;
    tags?: string[];
    isGlobal?: boolean;
    createdBy?: number;
  }): Promise<ResponseFormat> {
    try {
      const [id] = await db("response_formats").insert({
        name: formatData.name,
        description: formatData.description,
        structure: JSON.stringify(formatData.structure),
        category: formatData.category,
        tags: formatData.tags ? JSON.stringify(formatData.tags) : null,
        is_global: formatData.isGlobal ?? false,
        usage_count: 0,
        created_by: formatData.createdBy,
        created_at: new Date(),
        updated_at: new Date(),
      });

      return this.findById(id) as Promise<ResponseFormat>;
    } catch (error) {
      console.error("Error creating response format:", error);
      throw error;
    }
  }

  /**
   * Update response format
   */
  static async update(
    id: number,
    formatData: {
      name?: string;
      description?: string;
      structure?: object;
      category?: string;
      tags?: string[];
      isGlobal?: boolean;
    },
  ): Promise<ResponseFormat | null> {
    try {
      const updateData: any = {
        updated_at: new Date(),
      };

      if (formatData.name) updateData.name = formatData.name;
      if (formatData.description !== undefined)
        updateData.description = formatData.description;
      if (formatData.structure)
        updateData.structure = JSON.stringify(formatData.structure);
      if (formatData.category !== undefined)
        updateData.category = formatData.category;
      if (formatData.tags !== undefined)
        updateData.tags = JSON.stringify(formatData.tags);
      if (formatData.isGlobal !== undefined)
        updateData.is_global = formatData.isGlobal;

      await db("response_formats").where("id", id).update(updateData);

      return this.findById(id);
    } catch (error) {
      console.error("Error updating response format:", error);
      throw error;
    }
  }

  /**
   * Delete response format
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await db("response_formats").where("id", id).delete();
      return true;
    } catch (error) {
      console.error("Error deleting response format:", error);
      return false;
    }
  }

  /**
   * Increment format usage count
   */
  static async incrementUsageCount(id: number): Promise<boolean> {
    try {
      await db("response_formats")
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
  }

  /**
   * Get all response format categories
   */
  static async getCategories(): Promise<string[]> {
    try {
      const categories = await db("response_formats")
        .distinct("category")
        .whereNotNull("category");

      return categories.map((c) => c.category);
    } catch (error) {
      console.error("Error getting response format categories:", error);
      throw error;
    }
  }
}
