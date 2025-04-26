import { Request, Response } from "express";
import { ResponseFormatService } from "./service";
import { asyncHandler } from "../../middleware/errorHandler";
import { AppError } from "../../middleware/errorHandler";

export const ResponseFormatController = {
  /**
   * Get all response formats with pagination and filtering
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

    const result = await ResponseFormatService.findAll({
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
   * Get response format by ID
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const format = await ResponseFormatService.findById(parseInt(id));

    if (!format) {
      throw new AppError("Response format not found", 404);
    }

    // Check if the format is global or belongs to the user
    if (!format.isGlobal && format.createdBy !== req.userId) {
      throw new AppError("Not authorized to access this response format", 403);
    }

    res.json(format);
  }),

  /**
   * Create a new response format
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { name, description, structure, category, tags, isGlobal } = req.body;

    // Only admins can create global formats
    if (isGlobal) {
      const isAdmin = await req.user?.roles?.some(
        (role) => role.name === "admin",
      );
      if (!isAdmin) {
        throw new AppError(
          "Only admins can create global response formats",
          403,
        );
      }
    }

    const format = await ResponseFormatService.create({
      name,
      description,
      structure,
      category,
      tags,
      isGlobal: isGlobal || false,
      createdBy: req.userId,
    });

    res.status(201).json(format);
  }),

  /**
   * Update response format
   */
  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;
    const { name, description, structure, category, tags, isGlobal } = req.body;

    // Check if the format exists
    const existingFormat = await ResponseFormatService.findById(parseInt(id));
    if (!existingFormat) {
      throw new AppError("Response format not found", 404);
    }

    // Check if the user can update this format
    const isAdmin = await req.user?.roles?.some(
      (role) => role.name === "admin",
    );
    if (
      !isAdmin &&
      (existingFormat.isGlobal || existingFormat.createdBy !== req.userId)
    ) {
      throw new AppError("Not authorized to update this response format", 403);
    }

    // Only admins can set formats as global
    if (isGlobal && !isAdmin) {
      throw new AppError("Only admins can set response formats as global", 403);
    }

    const updatedFormat = await ResponseFormatService.update(parseInt(id), {
      name,
      description,
      structure,
      category,
      tags,
      isGlobal,
    });

    res.json(updatedFormat);
  }),

  /**
   * Delete response format
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;

    // Check if the format exists
    const existingFormat = await ResponseFormatService.findById(parseInt(id));
    if (!existingFormat) {
      throw new AppError("Response format not found", 404);
    }

    // Check if the user can delete this format
    const isAdmin = await req.user?.roles?.some(
      (role) => role.name === "admin",
    );
    if (
      !isAdmin &&
      (existingFormat.isGlobal || existingFormat.createdBy !== req.userId)
    ) {
      throw new AppError("Not authorized to delete this response format", 403);
    }

    await ResponseFormatService.delete(parseInt(id));

    res.json({ message: "Response format deleted successfully" });
  }),

  /**
   * Get all response format categories
   */
  getCategories: asyncHandler(async (_req: Request, res: Response) => {
    const categories = await ResponseFormatService.getCategories();
    res.json(categories);
  }),
};
