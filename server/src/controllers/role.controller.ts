import { Request, Response } from "express";
import { RoleModel } from "../models/Role";
import { PermissionModel } from "../models/Permission";
import { asyncHandler } from "../middleware/errorHandler";
import { AppError } from "../middleware/errorHandler";

export const RoleController = {
  /**
   * Get all roles
   */
  getAllRoles: asyncHandler(async (req: Request, res: Response) => {
    const roles = await RoleModel.findAll();
    res.json(roles);
  }),

  /**
   * Get role by ID
   */
  getRoleById: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const role = await RoleModel.findById(parseInt(id));

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    res.json(role);
  }),

  /**
   * Create a new role
   */
  createRole: asyncHandler(async (req: Request, res: Response) => {
    const { name, description } = req.body;

    if (!name) {
      throw new AppError("Role name is required", 400);
    }

    // Check if role already exists
    const existingRole = await RoleModel.findByName(name);
    if (existingRole) {
      throw new AppError("Role already exists", 409);
    }

    const role = await RoleModel.create({ name, description });
    res.status(201).json(role);
  }),

  /**
   * Update role
   */
  updateRole: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description } = req.body;

    const role = await RoleModel.update(parseInt(id), { name, description });

    if (!role) {
      throw new AppError("Role not found", 404);
    }

    res.json(role);
  }),

  /**
   * Delete role
   */
  deleteRole: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const roleId = parseInt(id);

    // Check if role exists
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Prevent deletion of essential roles
    if (role.name === "admin" || role.name === "user") {
      throw new AppError("Cannot delete essential system roles", 403);
    }

    // Delete role
    await RoleModel.delete(roleId);

    res.json({ message: "Role deleted successfully" });
  }),

  /**
   * Get role permissions
   */
  getRolePermissions: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const roleId = parseInt(id);

    // Check if role exists
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    const permissions = await RoleModel.getPermissions(roleId);
    res.json(permissions);
  }),

  /**
   * Assign permission to role
   */
  assignPermission: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { permissionId } = req.body;

    if (!permissionId) {
      throw new AppError("Permission ID is required", 400);
    }

    // Check if role exists
    const role = await RoleModel.findById(parseInt(id));
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Check if permission exists
    const permission = await PermissionModel.findById(permissionId);
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    // Assign permission to role
    await RoleModel.assignPermission(parseInt(id), permissionId);

    // Get updated permissions
    const permissions = await RoleModel.getPermissions(parseInt(id));

    res.json({
      message: "Permission assigned successfully",
      permissions,
    });
  }),

  /**
   * Remove permission from role
   */
  removePermission: asyncHandler(async (req: Request, res: Response) => {
    const { id, permissionId } = req.params;

    // Check if role exists
    const role = await RoleModel.findById(parseInt(id));
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    // Check if permission exists
    const permission = await PermissionModel.findById(parseInt(permissionId));
    if (!permission) {
      throw new AppError("Permission not found", 404);
    }

    // Remove permission from role
    await RoleModel.removePermission(parseInt(id), parseInt(permissionId));

    // Get updated permissions
    const permissions = await RoleModel.getPermissions(parseInt(id));

    res.json({
      message: "Permission removed successfully",
      permissions,
    });
  }),

  /**
   * Get users with role
   */
  getRoleUsers: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const roleId = parseInt(id);

    // Check if role exists
    const role = await RoleModel.findById(roleId);
    if (!role) {
      throw new AppError("Role not found", 404);
    }

    const users = await RoleModel.getUsers(roleId);
    res.json(users);
  }),
};
