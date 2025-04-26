import express from "express";
import { authenticate } from "../middleware/auth";
import { AIService } from "../services/aiService";
import { db } from "../lib/db";

const router = express.Router();

// Process a chat message
router.post("/process", authenticate, async (req, res) => {
  try {
    const { query, templateId, variables = {} } = req.body;

    if (!query || !templateId) {
      return res
        .status(400)
        .json({ message: "Query and templateId are required" });
    }

    // Process the query
    const response = await AIService.processQuery(query, templateId, variables);

    // Save the conversation
    const [conversationId] = await db("conversations").insert({
      user_id: req.user.id,
      template_id: templateId,
      response_format_id: response.formatId,
      query,
      response: JSON.stringify(response.content),
      raw_response: response.rawContent,
      variables: JSON.stringify(variables),
      created_at: new Date(),
    });

    res.json({
      conversationId,
      response: response.content,
      formatted: response.formatted,
      usage: response.usage,
    });
  } catch (error) {
    console.error("Error processing chat message:", error);
    res.status(500).json({ message: "Failed to process message" });
  }
});

// Get conversation history
router.get("/history", authenticate, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const conversations = await db("conversations")
      .select(
        "conversations.*",
        "templates.name as template_name",
        "response_formats.name as format_name",
      )
      .leftJoin("templates", "conversations.template_id", "templates.id")
      .leftJoin(
        "response_formats",
        "conversations.response_format_id",
        "response_formats.id",
      )
      .where("conversations.user_id", req.user.id)
      .orderBy("conversations.created_at", "desc")
      .limit(Number(limit))
      .offset(offset);

    const [{ count }] = await db("conversations")
      .where("user_id", req.user.id)
      .count("* as count");

    const processedConversations = conversations.map((conv) => ({
      id: conv.id,
      query: conv.query,
      response: JSON.parse(conv.response),
      rawResponse: conv.raw_response,
      variables: JSON.parse(conv.variables),
      templateId: conv.template_id,
      templateName: conv.template_name,
      responseFormatId: conv.response_format_id,
      formatName: conv.format_name,
      createdAt: conv.created_at,
    }));

    res.json({
      conversations: processedConversations,
      pagination: {
        total: Number(count),
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(Number(count) / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching conversation history:", error);
    res.status(500).json({ message: "Failed to fetch conversation history" });
  }
});

export default router;
