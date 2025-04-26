import { Request, Response } from "express";
import { WidgetConfigService } from "./service";
import { asyncHandler } from "../../middleware/errorHandler";
import { AppError } from "../../middleware/errorHandler";

export const WidgetConfigController = {
  /**
   * Get all widget configs
   */
  getAll: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const configs = await WidgetConfigService.findByUser(req.userId);
    res.json(configs);
  }),

  /**
   * Get widget config by ID
   */
  getById: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;
    const config = await WidgetConfigService.findById(parseInt(id));

    if (!config) {
      throw new AppError("Widget config not found", 404);
    }

    // Check if the config belongs to the user
    if (config.userId !== req.userId) {
      throw new AppError("Not authorized to access this widget config", 403);
    }

    res.json(config);
  }),

  /**
   * Create a new widget config
   */
  create: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { name, config, isActive } = req.body;

    const widgetConfig = await WidgetConfigService.create({
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
  update: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;
    const { name, config, isActive } = req.body;

    // Check if the config exists and belongs to the user
    const existingConfig = await WidgetConfigService.findById(parseInt(id));
    if (!existingConfig) {
      throw new AppError("Widget config not found", 404);
    }

    if (existingConfig.userId !== req.userId) {
      throw new AppError("Not authorized to update this widget config", 403);
    }

    const updatedConfig = await WidgetConfigService.update(parseInt(id), {
      name,
      config,
      isActive,
    });

    res.json(updatedConfig);
  }),

  /**
   * Delete widget config
   */
  delete: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;

    // Check if the config exists and belongs to the user
    const existingConfig = await WidgetConfigService.findById(parseInt(id));
    if (!existingConfig) {
      throw new AppError("Widget config not found", 404);
    }

    if (existingConfig.userId !== req.userId) {
      throw new AppError("Not authorized to delete this widget config", 403);
    }

    await WidgetConfigService.delete(parseInt(id));

    res.json({ message: "Widget config deleted successfully" });
  }),

  /**
   * Set a widget config as active
   */
  setActive: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;

    // Check if the config exists and belongs to the user
    const existingConfig = await WidgetConfigService.findById(parseInt(id));
    if (!existingConfig) {
      throw new AppError("Widget config not found", 404);
    }

    if (existingConfig.userId !== req.userId) {
      throw new AppError("Not authorized to activate this widget config", 403);
    }

    await WidgetConfigService.setActive(parseInt(id), req.userId);

    res.json({ message: "Widget config activated successfully" });
  }),

  /**
   * Get active widget config
   */
  getActive: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const config = await WidgetConfigService.getActive(req.userId);

    if (!config) {
      throw new AppError("No active widget config found", 404);
    }

    res.json(config);
  }),

  /**
   * Get widget embed code
   */
  getEmbedCode: asyncHandler(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw new AppError("Not authenticated", 401);
    }

    const { id } = req.params;

    // Check if the config exists and belongs to the user
    const existingConfig = await WidgetConfigService.findById(parseInt(id));
    if (!existingConfig) {
      throw new AppError("Widget config not found", 404);
    }

    if (existingConfig.userId !== req.userId) {
      throw new AppError("Not authorized to access this widget config", 403);
    }

    // Generate embed code
    const code = `<script src="${process.env.WIDGET_URL || "https://widget.example.com"}/widget.js" id="chat-widget" data-config-id="${id}"></script>`;

    res.json({ code });
  }),
};
