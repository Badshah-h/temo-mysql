import express from "express";
import { authenticate, checkPermission, checkRole } from "../middleware/auth";
import { PromptTemplateModel } from "../db/models/PromptTemplate";

const router = express.Router();

// Get all prompt templates with filtering and pagination
router.get("/", authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    const category = req.query.category as string;
    const isGlobal =
      req.query.isGlobal === "true"
        ? true
        : req.query.isGlobal === "false"
          ? false
          : undefined;
    const createdBy = req.query.createdBy
      ? parseInt(req.query.createdBy as string)
      : undefined;
    const sortBy = (req.query.sortBy as string) || "name";
    const sortOrder =
      ((req.query.sortOrder as string) || "asc") === "desc" ? "desc" : "asc";

    // Check if user is requesting only their templates or has permission to view all
    const isAdmin = req.user.role === "admin";
    const userId = req.user.id;

    // If not admin and trying to view others' templates, restrict to own templates
    const effectiveCreatedBy =
      !isAdmin && createdBy !== userId ? userId : createdBy;

    const result = await PromptTemplateModel.getAll(
      page,
      limit,
      search,
      category,
      isGlobal,
      effectiveCreatedBy,
      sortBy,
      sortOrder,
    );

    res.json({
      templates: result.templates,
      pagination: {
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching prompt templates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get template categories
router.get("/categories", authenticate, async (_req, res) => {
  try {
    const categories = await PromptTemplateModel.getAllCategories();
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching template categories:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get prompt template by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const template = await PromptTemplateModel.findById(templateId);

    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check if user has access to this template
    const hasAccess = await PromptTemplateModel.canUserAccessTemplate(
      req.user.id,
      templateId,
      "view",
    );

    if (
      !hasAccess &&
      template.createdBy !== req.user.id &&
      !template.isGlobal &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json({ template });
  } catch (error) {
    console.error("Error fetching prompt template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Create new prompt template
router.post(
  "/",
  authenticate,
  checkPermission("templates.create"),
  async (req, res) => {
    try {
      const { name, description, content, category, tags, metadata, isGlobal } =
        req.body;

      // Validate input
      if (!name || !content) {
        return res
          .status(400)
          .json({ message: "Name and content are required" });
      }

      // Create template
      const template = await PromptTemplateModel.create({
        name,
        description,
        content,
        category,
        tags,
        metadata,
        isGlobal: isGlobal || false,
        createdBy: req.user.id,
      });

      if (!template) {
        return res.status(500).json({ message: "Failed to create template" });
      }

      res
        .status(201)
        .json({ message: "Template created successfully", template });
    } catch (error) {
      console.error("Error creating prompt template:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

// Update prompt template
router.put("/:id", authenticate, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const { name, description, content, category, tags, metadata, isGlobal } =
      req.body;

    // Check if template exists
    const existingTemplate = await PromptTemplateModel.findById(templateId);
    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check if user has permission to edit this template
    const hasAccess = await PromptTemplateModel.canUserAccessTemplate(
      req.user.id,
      templateId,
      "edit",
    );

    if (
      !hasAccess &&
      existingTemplate.createdBy !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update template
    const updatedTemplate = await PromptTemplateModel.update(templateId, {
      name,
      description,
      content,
      category,
      tags,
      metadata,
      isGlobal,
    });

    if (!updatedTemplate) {
      return res.status(500).json({ message: "Failed to update template" });
    }

    res.json({
      message: "Template updated successfully",
      template: updatedTemplate,
    });
  } catch (error) {
    console.error("Error updating prompt template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Delete prompt template
router.delete("/:id", authenticate, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);

    // Check if template exists
    const existingTemplate = await PromptTemplateModel.findById(templateId);
    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Check if user has permission to delete this template
    const hasAccess = await PromptTemplateModel.canUserAccessTemplate(
      req.user.id,
      templateId,
      "delete",
    );

    if (
      !hasAccess &&
      existingTemplate.createdBy !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Delete template
    const success = await PromptTemplateModel.delete(templateId);

    if (!success) {
      return res.status(500).json({ message: "Failed to delete template" });
    }

    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting prompt template:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Increment usage count
router.post("/:id/increment-usage", authenticate, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);

    // Check if template exists
    const existingTemplate = await PromptTemplateModel.findById(templateId);
    if (!existingTemplate) {
      return res.status(404).json({ message: "Template not found" });
    }

    // Increment usage count
    const success = await PromptTemplateModel.incrementUsageCount(templateId);

    if (!success) {
      return res
        .status(500)
        .json({ message: "Failed to increment usage count" });
    }

    res.json({ message: "Usage count incremented successfully" });
  } catch (error) {
    console.error("Error incrementing template usage count:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Set role access for a template
router.post(
  "/:id/access",
  authenticate,
  checkRole("admin"),
  async (req, res) => {
    try {
      const templateId = parseInt(req.params.id);
      const { roleId, canView, canEdit, canDelete } = req.body;

      // Validate input
      if (!roleId) {
        return res.status(400).json({ message: "Role ID is required" });
      }

      // Check if template exists
      const existingTemplate = await PromptTemplateModel.findById(templateId);
      if (!existingTemplate) {
        return res.status(404).json({ message: "Template not found" });
      }

      // Set role access
      const success = await PromptTemplateModel.setRoleAccess(
        templateId,
        roleId,
        {
          canView,
          canEdit,
          canDelete,
        },
      );

      if (!success) {
        return res.status(500).json({ message: "Failed to set role access" });
      }

      res.json({ message: "Role access set successfully" });
    } catch (error) {
      console.error("Error setting template role access:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

export default router;
