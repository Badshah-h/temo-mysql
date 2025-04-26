import { Request, Response } from "express";
import { PermissionService } from "./service";
import { asyncHandler } from "../../middleware/errorHandler";
import { AppError } from "../../middleware/errorHandler";

export const PermissionController = {
  /**
   * Get all permissions
   */
  getAllPermissions: asyncHandler(async (_req: Request, res: Response) => {
    const permissions = await PermissionService.findAll();
    res.json(permissions);
  }),

  /**
   * Get permission by ID
   */
  getPermissionById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const permission = await PermissionService.findById(parseInt(id));

    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    res.json(permission);
  }),

  /**
   * Create a new permission
   */
  createPermission: asyncHandler(async (req: Request, res: Response) => {
    const { name, description, category } = req.body;

    // Check if permission already exists
    const existingPermission = await PermissionService.findByName(name);
    if (existingPermission) {
      throw new AppError("Permission already exists", 409);
    }

    const permission = await PermissionService.create({
      name,
      description,
      category,
    });
    res.status(201).json(permission);
  }),

  /**
   * Update permission
   */
  updatePermission: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, category } = req.body;

    const permission = await PermissionService.update(parseInt(id), {
      name,
      description,
      category,
    });

    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    res.json(permission);
  }),

  /**
   * Delete permission
   */
  deletePermission: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const permissionId = parseInt(id);

    // Check if permission exists
    const permission = await PermissionService.findById(permissionId);
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    // Delete permission
    await PermissionService.delete(permissionId);

    res.json({ message: "Permission deleted successfully" });
  }),

  /**
   * Get roles with permission
   */
  getPermissionRoles: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const permissionId = parseInt(id);

    // Check if permission exists
    const permission = await PermissionService.findById(permissionId);
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    const roles = await PermissionService.getRoles(permissionId);
    res.json(roles);
  }),
};
