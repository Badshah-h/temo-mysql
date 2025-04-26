import express from "express";
import { authenticate, checkPermission } from "../middleware/auth.js";
import { RoleModel } from "../db/models/Role.js";
import { PermissionModel } from "../db/models/Permission.js";
import pool from "../lib/db.js";

const router = express.Router();

// Get all roles
router.get(
  "/",
  authenticate,
  checkPermission("roles.view"),
  async (req, res) => {
    try {
      const roles = await RoleModel.getAllWithPermissionCount();
      res.json({ roles });
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get role by ID
router.get(
  "/:id",
  authenticate,
  checkPermission("roles.view"),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const role = await RoleModel.findByIdWithPermissions(roleId);

      if (!role) {
        return res.status(404).json({ message: "Role not found" });
      }

      res.json({ role });
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Create new role
router.post(
  "/",
  authenticate,
  checkPermission("roles.create"),
  async (req, res) => {
    try {
      const { name, description, permissions } = req.body;

      // Validate input
      if (!name) {
        return res.status(400).json({ message: "Role name is required" });
      }

      // Check if role already exists
      const existingRole = await RoleModel.findByName(name);
      if (existingRole) {
        return res
          .status(409)
          .json({ message: "Role with this name already exists" });
      }

      // Create role
      const role = await RoleModel.create({
        name,
        description,
        permissions,
      });

      if (!role) {
        return res.status(500).json({ message: "Failed to create role" });
      }

      res.status(201).json({ message: "Role created successfully", role });
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Update role
router.put(
  "/:id",
  authenticate,
  checkPermission("roles.edit"),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const { name, description, permissions } = req.body;

      // Validate input
      if (!name) {
        return res.status(400).json({ message: "Role name is required" });
      }

      // Check if role exists
      const existingRole = await RoleModel.findById(roleId);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      // Check if name is already taken by another role
      if (name !== existingRole.name) {
        const roleWithSameName = await RoleModel.findByName(name);
        if (roleWithSameName && roleWithSameName.id !== roleId) {
          return res
            .status(409)
            .json({ message: "Another role with this name already exists" });
        }
      }

      // Update role
      const updatedRole = await RoleModel.update(roleId, {
        name,
        description,
        permissions,
      });

      if (!updatedRole) {
        return res.status(500).json({ message: "Failed to update role" });
      }

      res.json({ message: "Role updated successfully", role: updatedRole });
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Delete role
router.delete(
  "/:id",
  authenticate,
  checkPermission("roles.delete"),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);

      // Check if role exists
      const existingRole = await RoleModel.findById(roleId);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      // Prevent deleting built-in roles
      if (["admin", "user", "moderator"].includes(existingRole.name)) {
        return res
          .status(403)
          .json({ message: "Cannot delete built-in roles" });
      }

      // Delete role
      const success = await RoleModel.delete(roleId);

      if (!success) {
        return res.status(500).json({ message: "Failed to delete role" });
      }

      res.json({ message: "Role deleted successfully" });
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get role permissions
router.get(
  "/:id/permissions",
  authenticate,
  checkPermission("roles.view"),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const permissions = await PermissionModel.getPermissionsForRole(roleId);
      res.json({ permissions });
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Assign permissions to role
router.post(
  "/:id/permissions",
  authenticate,
  checkPermission("permissions.assign"),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const { permissionIds } = req.body;

      // Validate input
      if (!Array.isArray(permissionIds)) {
        return res
          .status(400)
          .json({ message: "Permission IDs must be an array" });
      }

      // Check if role exists
      const existingRole = await RoleModel.findById(roleId);
      if (!existingRole) {
        return res.status(404).json({ message: "Role not found" });
      }

      // First remove all existing permissions
      await pool.query("DELETE FROM role_permissions WHERE role_id = ?", [
        roleId,
      ]);

      // Then assign new permissions
      if (permissionIds.length > 0) {
        const success = await RoleModel.assignPermissionsToRole(
          roleId,
          permissionIds,
          req.user.id,
        );
        if (!success) {
          return res
            .status(500)
            .json({ message: "Failed to assign permissions" });
        }
      }

      res.json({ message: "Permissions assigned successfully" });
    } catch (error) {
      console.error("Error assigning permissions to role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get users with role
router.get(
  "/:id/users",
  authenticate,
  checkPermission(["roles.view", "users.view"]),
  async (req, res) => {
    try {
      const roleId = parseInt(req.params.id);
      const users = await RoleModel.getUsersWithRole(roleId);
      res.json({ users });
    } catch (error) {
      console.error("Error fetching users with role:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
