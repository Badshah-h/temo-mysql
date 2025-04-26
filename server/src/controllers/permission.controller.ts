import { Request, Response } from "express";
import { PermissionModel } from "../models/Permission";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";

export const PermissionController = {
  /**
   * Get all permissions
   */
  getAllPermissions: asyncHandler(async (req: Request, res: Response) => {
    const permissions = await PermissionModel.findAll();
    res.json(permissions);
  }),

  /**
   * Get permission by ID
   */
  getPermissionById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const permission = await PermissionModel.findById(parseInt(id));

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

    if (!name) {
      throw new AppError("Permission name is required", 400);
    }

    // Check if permission already exists
    const existingPermission = await PermissionModel.findByName(name);
    if (existingPermission) {
      throw new AppError("Permission already exists", 409);
    }

    const permission = await PermissionModel.create({
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

    const permission = await PermissionModel.update(parseInt(id), {
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
    const permission = await PermissionModel.findById(permissionId);
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    // Delete permission
    await PermissionModel.delete(permissionId);

    res.json({ message: "Permission deleted successfully" });
  }),

  /**
   * Get roles with permission
   */
  getPermissionRoles: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const permissionId = parseInt(id);

    // Check if permission exists
    const permission = await PermissionModel.findById(permissionId);
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    const roles = await PermissionModel.getRoles(permissionId);
    res.json(roles);
  }),
};
