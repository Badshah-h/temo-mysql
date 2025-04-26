import pool from "../../lib/db";

export interface PromptTemplate {
  id: number;
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isGlobal: boolean;
  createdBy: number;
  createdAt?: Date;
  updatedAt?: Date;
  usageCount: number;
  creator?: {
    id: number;
    fullName: string;
    email: string;
  };
}

export interface CreatePromptTemplateData {
  name: string;
  description?: string;
  content: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isGlobal?: boolean;
  createdBy: number;
}

export interface UpdatePromptTemplateData {
  name?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isGlobal?: boolean;
}

export class PromptTemplateModel {
  /**
   * Find template by ID
   */
  static async findById(id: number): Promise<PromptTemplate | null> {
    try {
      const [rows] = await pool.execute(
        `SELECT pt.id, pt.name, pt.description, pt.content, pt.category, 
                pt.tags, pt.metadata, pt.is_global as isGlobal, 
                pt.created_by as createdBy, pt.created_at as createdAt, 
                pt.updated_at as updatedAt, pt.usage_count as usageCount,
                u.full_name as creatorName, u.email as creatorEmail
         FROM prompt_templates pt
         LEFT JOIN users u ON pt.created_by = u.id
         WHERE pt.id = ?`,
        [id],
      );

      const templates = rows as any[];

      if (templates.length === 0) {
        return null;
      }

      const template = templates[0];

      // Parse JSON fields
      if (template.tags && typeof template.tags === "string") {
        template.tags = JSON.parse(template.tags);
      }

      if (template.metadata && typeof template.metadata === "string") {
        template.metadata = JSON.parse(template.metadata);
      }

      // Add creator info if available
      if (template.creatorName) {
        template.creator = {
          id: template.createdBy,
          fullName: template.creatorName,
          email: template.creatorEmail,
        };

        // Remove redundant fields
        delete template.creatorName;
        delete template.creatorEmail;
      }

      return template as PromptTemplate;
    } catch (error) {
      console.error("Error finding prompt template by ID:", error);
      return null;
    }
  }

  /**
   * Get all templates with filtering and pagination
   */
  static async getAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    category?: string,
    isGlobal?: boolean,
    createdBy?: number,
    sortBy: string = "name",
    sortOrder: "asc" | "desc" = "asc",
  ): Promise<{ templates: PromptTemplate[]; total: number }> {
    try {
      const offset = (page - 1) * limit;
      const queryParams: any[] = [];
      let whereConditions: string[] = [];

      // Build where conditions
      if (search) {
        whereConditions.push("(pt.name LIKE ? OR pt.description LIKE ?)");
        queryParams.push(`%${search}%`, `%${search}%`);
      }

      if (category) {
        whereConditions.push("pt.category = ?");
        queryParams.push(category);
      }

      if (isGlobal !== undefined) {
        whereConditions.push("pt.is_global = ?");
        queryParams.push(isGlobal ? 1 : 0);
      }

      if (createdBy) {
        whereConditions.push("pt.created_by = ?");
        queryParams.push(createdBy);
      }

      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      // Determine sort column
      const sortColumn =
        sortBy === "name"
          ? "pt.name"
          : sortBy === "category"
            ? "pt.category"
            : sortBy === "createdAt"
              ? "pt.created_at"
              : sortBy === "usageCount"
                ? "pt.usage_count"
                : "pt.name";

      // Query for templates
      const query = `
        SELECT pt.id, pt.name, pt.description, pt.content, pt.category, 
               pt.tags, pt.metadata, pt.is_global as isGlobal, 
               pt.created_by as createdBy, pt.created_at as createdAt, 
               pt.updated_at as updatedAt, pt.usage_count as usageCount,
               u.full_name as creatorName, u.email as creatorEmail
        FROM prompt_templates pt
        LEFT JOIN users u ON pt.created_by = u.id
        ${whereClause}
        ORDER BY ${sortColumn} ${sortOrder === "desc" ? "DESC" : "ASC"}
        LIMIT ? OFFSET ?
      `;

      // Add limit and offset to params
      queryParams.push(limit, offset);

      const [rows] = await pool.execute(query, queryParams);
      const templates = rows as any[];

      // Process templates
      const processedTemplates = templates.map((template) => {
        // Parse JSON fields
        if (template.tags && typeof template.tags === "string") {
          template.tags = JSON.parse(template.tags);
        }

        if (template.metadata && typeof template.metadata === "string") {
          template.metadata = JSON.parse(template.metadata);
        }

        // Add creator info if available
        if (template.creatorName) {
          template.creator = {
            id: template.createdBy,
            fullName: template.creatorName,
            email: template.creatorEmail,
          };

          // Remove redundant fields
          delete template.creatorName;
          delete template.creatorEmail;
        }

        return template;
      });

      // Count query for pagination
      const countQuery = `
        SELECT COUNT(*) as total
        FROM prompt_templates pt
        ${whereClause}
      `;

      const [countResult] = await pool.execute(
        countQuery,
        queryParams.slice(0, -2),
      );
      const total = (countResult as any[])[0].total;

      return {
        templates: processedTemplates as PromptTemplate[],
        total,
      };
    } catch (error) {
      console.error("Error getting prompt templates:", error);
      return { templates: [], total: 0 };
    }
  }

  /**
   * Create a new prompt template
   */
  static async create(
    templateData: CreatePromptTemplateData,
  ): Promise<PromptTemplate | null> {
    try {
      const {
        name,
        description,
        content,
        category,
        tags,
        metadata,
        isGlobal,
        createdBy,
      } = templateData;

      // Prepare JSON fields
      const tagsJson = tags ? JSON.stringify(tags) : null;
      const metadataJson = metadata ? JSON.stringify(metadata) : null;

      const [result] = await pool.execute(
        `INSERT INTO prompt_templates 
         (name, description, content, category, tags, metadata, is_global, created_by) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          name,
          description || null,
          content,
          category || null,
          tagsJson,
          metadataJson,
          isGlobal || false,
          createdBy,
        ],
      );

      const insertId = (result as any).insertId;

      if (insertId) {
        return this.findById(insertId);
      }

      return null;
    } catch (error) {
      console.error("Error creating prompt template:", error);
      return null;
    }
  }

  /**
   * Update a prompt template
   */
  static async update(
    id: number,
    templateData: UpdatePromptTemplateData,
  ): Promise<PromptTemplate | null> {
    try {
      const fields: string[] = [];
      const values: any[] = [];

      if (templateData.name !== undefined) {
        fields.push("name = ?");
        values.push(templateData.name);
      }

      if (templateData.description !== undefined) {
        fields.push("description = ?");
        values.push(templateData.description || null);
      }

      if (templateData.content !== undefined) {
        fields.push("content = ?");
        values.push(templateData.content);
      }

      if (templateData.category !== undefined) {
        fields.push("category = ?");
        values.push(templateData.category || null);
      }

      if (templateData.tags !== undefined) {
        fields.push("tags = ?");
        values.push(JSON.stringify(templateData.tags));
      }

      if (templateData.metadata !== undefined) {
        fields.push("metadata = ?");
        values.push(JSON.stringify(templateData.metadata));
      }

      if (templateData.isGlobal !== undefined) {
        fields.push("is_global = ?");
        values.push(templateData.isGlobal);
      }

      if (fields.length === 0) {
        return this.findById(id); // Nothing to update
      }

      values.push(id); // Add ID for WHERE clause

      await pool.execute(
        `UPDATE prompt_templates SET ${fields.join(", ")} WHERE id = ?`,
        values,
      );

      return this.findById(id);
    } catch (error) {
      console.error("Error updating prompt template:", error);
      return null;
    }
  }

  /**
   * Delete a prompt template
   */
  static async delete(id: number): Promise<boolean> {
    try {
      await pool.execute("DELETE FROM prompt_templates WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.error("Error deleting prompt template:", error);
      return false;
    }
  }

  /**
   * Increment usage count for a template
   */
  static async incrementUsageCount(id: number): Promise<boolean> {
    try {
      await pool.execute(
        "UPDATE prompt_templates SET usage_count = usage_count + 1 WHERE id = ?",
        [id],
      );
      return true;
    } catch (error) {
      console.error("Error incrementing usage count:", error);
      return false;
    }
  }

  /**
   * Get all categories
   */
  static async getAllCategories(): Promise<string[]> {
    try {
      const [rows] = await pool.execute(
        "SELECT DISTINCT category FROM prompt_templates WHERE category IS NOT NULL ORDER BY category",
      );

      return (rows as any[]).map((row) => row.category);
    } catch (error) {
      console.error("Error getting template categories:", error);
      return [];
    }
  }

  /**
   * Check if user can access template
   */
  static async canUserAccessTemplate(
    userId: number,
    templateId: number,
    accessType: "view" | "edit" | "delete" = "view",
  ): Promise<boolean> {
    try {
      // Get user's roles
      const [userRoles] = await pool.execute(
        "SELECT role_id FROM user_roles WHERE user_id = ?",
        [userId],
      );

      const roleIds = (userRoles as any[]).map((r) => r.role_id);

      if (roleIds.length === 0) {
        return false;
      }

      // Check if user is admin (role = 'admin')
      const [adminCheck] = await pool.execute(
        "SELECT 1 FROM roles WHERE id IN (?) AND name = 'admin' LIMIT 1",
        [roleIds],
      );

      if ((adminCheck as any[]).length > 0) {
        return true; // Admin can do anything
      }

      // Check if user is the creator of the template
      const [creatorCheck] = await pool.execute(
        "SELECT 1 FROM prompt_templates WHERE id = ? AND created_by = ? LIMIT 1",
        [templateId, userId],
      );

      if ((creatorCheck as any[]).length > 0) {
        return true; // Creator can do anything with their own templates
      }

      // Check if template is global and user wants to view
      if (accessType === "view") {
        const [globalCheck] = await pool.execute(
          "SELECT 1 FROM prompt_templates WHERE id = ? AND is_global = 1 LIMIT 1",
          [templateId],
        );

        if ((globalCheck as any[]).length > 0) {
          return true; // Anyone can view global templates
        }
      }

      // Check role-based permissions
      const accessColumn =
        accessType === "view"
          ? "can_view"
          : accessType === "edit"
            ? "can_edit"
            : "can_delete";

      const [accessCheck] = await pool.execute(
        `SELECT 1 FROM prompt_template_access 
         WHERE template_id = ? AND role_id IN (?) AND ${accessColumn} = 1 
         LIMIT 1`,
        [templateId, roleIds],
      );

      return (accessCheck as any[]).length > 0;
    } catch (error) {
      console.error("Error checking template access:", error);
      return false;
    }
  }

  /**
   * Set role access for a template
   */
  static async setRoleAccess(
    templateId: number,
    roleId: number,
    access: { canView?: boolean; canEdit?: boolean; canDelete?: boolean },
  ): Promise<boolean> {
    try {
      // Check if access record exists
      const [existing] = await pool.execute(
        "SELECT id FROM prompt_template_access WHERE template_id = ? AND role_id = ?",
        [templateId, roleId],
      );

      if ((existing as any[]).length > 0) {
        // Update existing access
        const fields: string[] = [];
        const values: any[] = [];

        if (access.canView !== undefined) {
          fields.push("can_view = ?");
          values.push(access.canView);
        }

        if (access.canEdit !== undefined) {
          fields.push("can_edit = ?");
          values.push(access.canEdit);
        }

        if (access.canDelete !== undefined) {
          fields.push("can_delete = ?");
          values.push(access.canDelete);
        }

        if (fields.length === 0) {
          return true; // Nothing to update
        }

        values.push(templateId, roleId); // Add for WHERE clause

        await pool.execute(
          `UPDATE prompt_template_access SET ${fields.join(", ")} 
           WHERE template_id = ? AND role_id = ?`,
          values,
        );
      } else {
        // Create new access record
        await pool.execute(
          `INSERT INTO prompt_template_access 
           (template_id, role_id, can_view, can_edit, can_delete) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            templateId,
            roleId,
            access.canView !== undefined ? access.canView : true,
            access.canEdit !== undefined ? access.canEdit : false,
            access.canDelete !== undefined ? access.canDelete : false,
          ],
        );
      }

      return true;
    } catch (error) {
      console.error("Error setting template role access:", error);
      return false;
    }
  }
}
