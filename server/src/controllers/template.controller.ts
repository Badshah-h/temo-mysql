import { Request, Response } from "express";
import { TemplateModel } from "../models/Template";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";

export const TemplateController = {
  /**
   * Get all templates
   */
  getAllTemplates: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, category, isGlobal, sortBy, sortOrder } =
      req.query;

    const templates = await TemplateModel.findAll({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      category: category as string,
      isGlobal: isGlobal ? isGlobal === "true" : undefined,
      createdBy: req.userId,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as "asc" | "desc") || "asc",
    });

    res.json(templates);
  }),

  /**
   * Get template by ID
   */
  getTemplateById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const template = await TemplateModel.findById(parseInt(id));

    if (!template) {
      throw new AppError("Template not found", 404);
    }

    res.json(template);
  }),

  /**
   * Create a new template
   */
  createTemplate: asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      description,
      content,
      category,
      tags,
      isGlobal,
      responseFormatId,
    } = req.body;

    if (!name || !content) {
      throw new AppError("Name and content are required", 400);
    }

    const template = await TemplateModel.create({
      name,
      description,
      content,
      category,
      tags,
      isGlobal,
      responseFormatId,
      createdBy: req.userId,
    });

    res.status(201).json(template);
  }),

  /**
   * Update template
   */
  updateTemplate: asyncHandler(async (req: Request, res: Response) => {
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

    const template = await TemplateModel.update(parseInt(id), {
      name,
      description,
      content,
      category,
      tags,
      isGlobal,
      responseFormatId,
    });

    if (!template) {
      throw new AppError("Template not found", 404);
    }

    res.json(template);
  }),

  /**
   * Delete template
   */
  deleteTemplate: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const templateId = parseInt(id);

    // Check if template exists
    const template = await TemplateModel.findById(templateId);
    if (!template) {
      throw new AppError("Template not found", 404);
    }

    // Delete template
    await TemplateModel.delete(templateId);

    res.json({ message: "Template deleted successfully" });
  }),

  /**
   * Get all template categories
   */
  getCategories: asyncHandler(async (req: Request, res: Response) => {
    const categories = await TemplateModel.getCategories();
    res.json(categories);
  }),
};
