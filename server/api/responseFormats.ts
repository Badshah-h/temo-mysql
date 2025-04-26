import express from "express";
import { authenticate } from "../middleware/auth";
import { db } from "../lib/db";

const router = express.Router();

// Get all response formats with filtering and pagination
router.get("/", authenticate, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      isGlobal,
      createdBy,
      sortBy = "name",
      sortOrder = "asc",
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build query
    let query = db("response_formats")
      .select(
        "response_formats.*",
        "users.full_name as creator_name",
        "users.email as creator_email"
      )
      .leftJoin("users", "response_formats.created_by", "users.id");

    // Apply filters
    if (search) {
      query = query.where((builder) => {
        builder
          .where("response_formats.name", "like", `%${search}%`)
          .orWhere("response_formats.description", "like", `%${search}%`);
      });
    }

    if (category) {
      query = query.where("response_formats.category", category);
    }

    if (isGlobal !== undefined) {
      query = query.where("response_formats.is_global", isGlobal === "true");
    }

    if (createdBy) {
      query = query.where("response_formats.created_by", Number(createdBy));
    }

    // Count total before pagination
    const [{ count }] = await query.clone().count("* as count");

    // Apply sorting and pagination
    const validSortColumns = [
      "name",
      "category",
      "created_at",
      "updated_at",
      "usage_count",
    ];
    const sortColumn = validSortColumns.includes(String(sortBy))
      ? String(sortBy)
      : "name";
    const order = sortOrder === "desc" ? "desc" : "asc";

    const formats = await query
      .orderBy(`response_formats.${sortColumn}`, order)
      .limit(Number(limit))
      .offset(offset);

    // Process formats
    const processedFormats = formats.map((format) => ({
      id: format.id,
      name: format.name,
      description: format.description,
      structure: JSON.parse(format.structure),
      category: format.category,
      tags: format.tags ? JSON.parse(format.tags) : [],
      isGlobal: Boolean(format.is_global),
      usageCount: format.usage_count,
      createdAt: format.created_at,
      updatedAt: format.updated_at,
      createdBy: format.created_by,
      creator: format.creator_name
        ? {
            id: format.created_by,
            fullName: format.creator_name,
            email: format.creator_email,
          }
        : undefined,
    }));

    res.json({
      formats: processedFormats,
      pagination: {
        total: Number(count),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(count) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching response formats:", error);
    res.status(500).json({ message: "Failed to fetch response formats" });
  }
});

// Get a single response format by ID
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const format = await db("response_formats")
      .select(
        "response_formats.*",
        "users.full_name as creator_name",
        "users.email as creator_email"
      )
      .leftJoin("users", "response_formats.created_by", "users.id")
      .where("response_formats.id", id)
      .first();

    if (!format) {
      return res.status(404).json({ message: "Response format not found" });
    }

    const processedFormat = {
      id: format.id,
      name: format.name,
      description: format.description,
      structure: JSON.parse(format.structure),
      category: format.category,
      tags: format.tags ? JSON.parse(format.tags) : [],
      isGlobal: Boolean(format.is_global),
      usageCount: format.usage_count,
      createdAt: format.created_at,
      updatedAt: format.updated_at,
      createdBy: format.created_by,
      creator: format.creator_name
        ? {
            id: format.created_by,
            fullName: format.creator_