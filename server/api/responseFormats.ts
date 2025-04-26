import express from "express";
import { authenticate } from "../middleware/auth";
import pool from "../lib/db";

const router = express.Router();

// GET /response-formats
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

    // Build the base query
    let query = `
      SELECT
        rf.*,
        u.full_name as creator_name,
        u.email as creator_email
      FROM response_formats rf
      LEFT JOIN users u ON rf.created_by = u.id
      WHERE 1=1
    `;

    const queryParams: any[] = [];

    // Add filters
    if (search) {
      query += ` AND (rf.name LIKE ? OR rf.description LIKE ?)`;
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (category) {
      query += ` AND rf.category = ?`;
      queryParams.push(category);
    }

    if (isGlobal !== undefined) {
      query += ` AND rf.is_global = ?`;
      queryParams.push(isGlobal === "true" ? 1 : 0);
    }

    if (createdBy) {
      query += ` AND rf.created_by = ?`;
      queryParams.push(Number(createdBy));
    }

    // Count total results
    const countQuery = `SELECT COUNT(*) as count FROM (${query}) as countTable`;
    const [countRows] = await pool.execute(countQuery, queryParams);
    const count = (countRows as any[])[0].count;

    // Valid sort fields
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

    const order = sortOrder === "desc" ? "DESC" : "ASC";

    // Add sorting and pagination
    query += ` ORDER BY rf.${sortColumn} ${order} LIMIT ? OFFSET ?`;
    queryParams.push(Number(limit), offset);

    // Execute the query
    const [rows] = await pool.execute(query, queryParams);
    const formats = rows as any[];

    // Format the response
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

// GET /response-formats/:id
router.get("/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT
        rf.*,
        u.full_name as creator_name,
        u.email as creator_email
      FROM response_formats rf
      LEFT JOIN users u ON rf.created_by = u.id
      WHERE rf.id = ?
    `;

    const [rows] = await pool.execute(query, [id]);
    const formats = rows as any[];

    if (formats.length === 0) {
      return res.status(404).json({ message: "Response format not found" });
    }

    const format = formats[0];

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
            fullName: format.creator_name,
            email: format.creator_email,
          }
        : undefined,
    };

    res.json(processedFormat);
  } catch (error) {
    console.error("Error fetching response format:", error);
    res.status(500).json({ message: "Failed to fetch response format" });
  }
});

export default router;
