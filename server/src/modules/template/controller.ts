import { Request, Response } from "express";
import { TemplateService } from "./service";
import { ResponseFormatService } from "../responseFormat/service";
import { asyncHandler } from "../../middleware/errorHandler";
import { AppError } from "../../middleware/errorHandler";

export const TemplateController = {
  /**
   * Get all templates with pagination and filtering
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    const {
      page = "1",
      limit = "10",
      search,
      category,
      isGlobal,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const result = await TemplateService.findAll({
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      search: search as string,
      category: category as string,
      isGlobal:
        isGlobal === "true" ? true : isGlobal === "false" ? false : undefined,
      createdBy: req.userId,
      sortBy: sortBy as string,
      sortOrder: sortOrder as "asc" | "desc",
    });

    res.json(result);
  }),

  /**
   * Get template by ID
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = await TemplateService.findById(parseInt(id));

    if (!template) {
      throw new AppError("Template not found", 404);
    }

    // Check if the template is global or belongs to the user
    if (!template.isGlobal && template.createdBy !== req.userId) {
      throw new AppError("Not authorized to access this template", 403);
    }

    res.json(template);
  }),

  /**
   * Create a new template
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const {
      name,
      description,
      content,
      category,
      tags,
      isGlobal,
      responseFormatId,
    } = req.body;

    // Only admins can create global templates
    if (isGlobal) {
      const isAdmin = await req.user?.roles?.some(
        (role) => role.name === "admin",
      );
      if (!isAdmin) {
        throw new AppError("Only admins can create global templates", 403);
      }
    }

    // Check if response format exists if provided
    if (responseFormatId) {
      const format = await ResponseFormatService.findById(responseFormatId);
      if (!format) {
        throw new AppError("Response format not found", 404);
      }
    }

    const template = await TemplateService.create({
      name,
      description,
      content,
      category,
      tags,
      isGlobal: isGlobal || false,
      responseFormatId,
      createdBy: req.userId,
    });

    res.status(201).json(template);
  }),

  /**
   * Update template
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;
    const {
      name,
      description,
      content,
      category,
      tags,
      isGlobal,
      responseFormatId,
    } = req.body;

    // Check if the template exists
    const existingTemplate = await TemplateService.findById(parseInt(id));
    if (!existingTemplate) {
      throw new AppError("Template not found", 404);
    }

    // Check if the user can update this template
    const isAdmin = await req.user?.roles?.some(
      (role) => role.name === "admin",
    );
    if (
      !isAdmin &&
      (existingTemplate.isGlobal || existingTemplate.createdBy !== req.userId)
    ) {
      throw new AppError("Not authorized to update this template", 403);
    }

    // Only admins can set templates as global
    if (isGlobal && !isAdmin) {
      throw new AppError("Only admins can set templates as global", 403);
    }

    // Check if response format exists if provided
    if (responseFormatId) {
      const format = await ResponseFormatService.findById(responseFormatId);
      if (!format) {
        throw new AppError("Response format not found", 404);
      }
    }

    const updatedTemplate = await TemplateService.update(parseInt(id), {
      name,
      description,
      content,
      category,
      tags,
      isGlobal,
      responseFormatId,
    });

    res.json(updatedTemplate);
  }),

  /**
   * Delete template
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;

    // Check if the template exists
    const existingTemplate = await TemplateService.findById(parseInt(id));
    if (!existingTemplate) {
      throw new AppError("Template not found", 404);
    }

    // Check if the user can delete this template
    const isAdmin = await req.user?.roles?.some(
      (role) => role.name === "admin",
    );
    if (
      !isAdmin &&
      (existingTemplate.isGlobal || existingTemplate.createdBy !== req.userId)
    ) {
      throw new AppError("Not authorized to delete this template", 403);
    }

    await TemplateService.delete(parseInt(id));

    res.json({ message: "Template deleted successfully" });
  }),

  /**
   * Get all template categories
   */
  getCategories: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await TemplateService.getCategories();
    res.json(categories);
  }),
};
