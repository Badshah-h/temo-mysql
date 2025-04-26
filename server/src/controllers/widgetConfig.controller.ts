import { Request, Response } from "express";
import { WidgetConfigModel } from "../models/WidgetConfig";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";

export const WidgetConfigController = {
  /**
   * Get all widget configs for current user
   */
  getUserConfigs: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const configs = await WidgetConfigModel.findByUser(req.userId);
    res.json(configs);
  }),

  /**
   * Get widget config by ID
   */
  getConfigById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const config = await WidgetConfigModel.findById(parseInt(id));

    if (!config) {
      throw new AppError("Widget config not found", 404);
    }

    // Check if user owns this config
    if (config.userId !== req.userId) {
      throw new AppError("Not authorized to access this config", 403);
    }

    res.json(config);
  }),

  /**
   * Create a new widget config
   */
  createConfig: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { name, config, isActive } = req.body;

    if (!name || !config) {
      throw new AppError("Name and config are required", 400);
    }

    const widgetConfig = await WidgetConfigModel.create({
      userId: req.userId,
      name,
      config,
      isActive,
    });

    res.status(201).json(widgetConfig);
  }),

  /**
   * Update widget config
   */
  updateConfig: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, config, isActive } = req.body;

    // Check if config exists and belongs to user
    const existingConfig = await WidgetConfigModel.findById(parseInt(id));
    if (!existingConfig) {
      throw new AppError("Widget config not found", 404);
    }

    if (existingConfig.userId !== req.userId) {
      throw new AppError("Not authorized to update this config", 403);
    }

    const updatedConfig = await WidgetConfigModel.update(parseInt(id), {
      name,
      config,
      isActive,
    });

    res.json(updatedConfig);
  }),

  /**
   * Delete widget config
   */
  deleteConfig: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const configId = parseInt(id);

    // Check if config exists and belongs to user
    const existingConfig = await WidgetConfigModel.findById(configId);
    if (!existingConfig) {
      throw new AppError("Widget config not found", 404);
    }

    if (existingConfig.userId !== req.userId) {
      throw new AppError("Not authorized to delete this config", 403);
    }

    // Delete config
    await WidgetConfigModel.delete(configId);

    res.json({ message: "Widget config deleted successfully" });
  }),

  /**
   * Set a widget config as active
   */
  setActiveConfig: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const configId = parseInt(id);

    // Check if config exists and belongs to user
    const existingConfig = await WidgetConfigModel.findById(configId);
    if (!existingConfig) {
      throw new AppError("Widget config not found", 404);
    }

    if (existingConfig.userId !== req.userId) {
      throw new AppError("Not authorized to update this config", 403);
    }

    // Set as active
    await WidgetConfigModel.setActive(configId, req.userId!);

    // Get all configs to return updated list
    const configs = await WidgetConfigModel.findByUser(req.userId!);

    res.json({
      message: "Widget config set as active",
      configs,
    });
  }),

  /**
   * Get active widget config for current user
   */
  getActiveConfig: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const config = await WidgetConfigModel.getActive(req.userId);

    if (!config) {
      return res.json(null);
    }

    res.json(config);
  }),
};
