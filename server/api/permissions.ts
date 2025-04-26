import express from "express";
import { authenticate, checkPermission } from "../middleware/auth.js";
import { PermissionModel } from "../db/models/Permission.js";

const router = express.Router();

// Get all permissions
router.get(
  "/",
  authenticate,
  checkPermission("permissions.view"),
  async (req, res) => {
    try {
      const permissions = await PermissionModel.getAll();
      res.json({ permissions });
    } catch (error) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get permissions by category
router.get(
  "/categories/:category",
  authenticate,
  checkPermission("permissions.view"),
  async (req, res) => {
    try {
      const category = req.params.category;
      const permissions = await PermissionModel.getByCategory(category);
      res.json({ permissions });
    } catch (error) {
      console.error("Error fetching permissions by category:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get all categories
router.get(
  "/categories",
  authenticate,
  checkPermission("permissions.view"),
  async (req, res) => {
    try {
      const categories = await PermissionModel.getAllCategories();
      res.json({ categories });
    } catch (error) {
      console.error("Error fetching permission categories:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Get permission by ID
router.get(
  "/:id",
  authenticate,
  checkPermission("permissions.view"),
  async (req, res) => {
    try {
      const permissionId = parseInt(req.params.id);
      const permission = await PermissionModel.findById(permissionId);

      if (!permission) {
        return res.status(404).json({ message: "Permission not found" });
      }

      res.json({ permission });
    } catch (error) {
      console.error("Error fetching permission:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Create new permission (admin only)
router.post("/", authenticate, checkRole("admin"), async (req, res) => {
  try {
    const { name, description, category } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: "Permission name is required" });
    }

    // Check if permission already exists
    const existingPermission = await PermissionModel.findByName(name);
    if (existingPermission) {
      return res
        .status(409)
        .json({ message: "Permission with this name already exists" });
    }

    // Create permission
    const permission = await PermissionModel.create({
      name,
      description,
      category,
    });

    if (!permission) {
      return res.status(500).json({ message: "Failed to create permission" });
    }

    res
      .status(201)
      .json({ message: "Permission created successfully", permission });
  } catch (error) {
    console.error("Error creating permission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update permission (admin only)
router.put("/:id", authenticate, checkRole("admin"), async (req, res) => {
  try {
    const permissionId = parseInt(req.params.id);
    const { name, description, category } = req.body;

    // Validate input
    if (!name) {
      return res.status(400).json({ message: "Permission name is required" });
    }

    // Check if permission exists
    const existingPermission = await PermissionModel.findById(permissionId);
    if (!existingPermission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Check if name is already taken by another permission
    if (name !== existingPermission.name) {
      const permissionWithSameName = await PermissionModel.findByName(name);
      if (
        permissionWithSameName &&
        permissionWithSameName.id !== permissionId
      ) {
        return res
          .status(409)
          .json({
            message: "Another permission with this name already exists",
          });
      }
    }

    // Update permission
    const updatedPermission = await PermissionModel.update(permissionId, {
      name,
      description,
      category,
    });

    if (!updatedPermission) {
      return res.status(500).json({ message: "Failed to update permission" });
    }

    res.json({
      message: "Permission updated successfully",
      permission: updatedPermission,
    });
  } catch (error) {
    console.error("Error updating permission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete permission (admin only)
router.delete("/:id", authenticate, checkRole("admin"), async (req, res) => {
  try {
    const permissionId = parseInt(req.params.id);

    // Check if permission exists
    const existingPermission = await PermissionModel.findById(permissionId);
    if (!existingPermission) {
      return res.status(404).json({ message: "Permission not found" });
    }

    // Delete permission
    const success = await PermissionModel.delete(permissionId);

    if (!success) {
      return res.status(500).json({ message: "Failed to delete permission" });
    }

    res.json({ message: "Permission deleted successfully" });
  } catch (error) {
    console.error("Error deleting permission:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
