import { Request, Response } from "express";
import { ResponseFormatModel } from "../models/ResponseFormat";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";

export const ResponseFormatController = {
  /**
   * Get all response formats
   */
  getAllFormats: asyncHandler(async (req: Request, res: Response) => {
    const { page, limit, search, category, isGlobal, sortBy, sortOrder } =
      req.query;

    const formats = await ResponseFormatModel.findAll({
      page: page ? parseInt(page as string) : undefined,
      limit: limit ? parseInt(limit as string) : undefined,
      search: search as string,
      category: category as string,
      isGlobal: isGlobal ? isGlobal === "true" : undefined,
      createdBy: req.userId,
      sortBy: sortBy as string,
      sortOrder: (sortOrder as "asc" | "desc") || "asc",
    });

    res.json(formats);
  }),

  /**
   * Get response format by ID
   */
  getFormatById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const format = await ResponseFormatModel.findById(parseInt(id));

    if (!format) {
      throw new AppError("Response format not found", 404);
    }

    res.json(format);
  }),

  /**
   * Create a new response format
   */
  createFormat: asyncHandler(async (req: Request, res: Response) => {
    const { name, description, structure, category, tags, isGlobal } = req.body;

    if (!name || !structure) {
      throw new AppError("Name and structure are required", 400);
    }

    const format = await ResponseFormatModel.create({
      name,
      description,
      structure,
      category,
      tags,
      isGlobal,
      createdBy: req.userId,
    });

    res.status(201).json(format);
  }),

  /**
   * Update response format
   */
  updateFormat: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, structure, category, tags, isGlobal } = req.body;

    const format = await ResponseFormatModel.update(parseInt(id), {
      name,
      description,
      structure,
      category,
      tags,
      isGlobal,
    });

    if (!format) {
      throw new AppError("Response format not found", 404);
    }

    res.json(format);
  }),

  /**
   * Delete response format
   */
  deleteFormat: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const formatId = parseInt(id);

    // Check if format exists
    const format = await ResponseFormatModel.findById(formatId);
    if (!format) {
      throw new AppError("Response format not found", 404);
    }

    // Delete format
    await ResponseFormatModel.delete(formatId);

    res.json({ message: "Response format deleted successfully" });
  }),

  /**
   * Get all format categories
   */
  getCategories: asyncHandler(async (req: Request, res: Response) => {
    const categories = await ResponseFormatModel.getCategories();
    res.json(categories);
  }),
};
