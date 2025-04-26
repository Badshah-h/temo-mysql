import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { testConnection } from "./lib/db.js"; // import authRoutes from "./api/auth"; // Removed old auth import
import userRoutes from "./api/users.js";
import rolesRoutes from "./api/roles.js";
import permissionsRoutes from "./api/permissions.js";
import promptTemplatesRoutes from "./api/promptTemplates.js";
import responseFormatsRoutes from "./api/responseFormats.js";
import testRoutes from "./api/test.js";
import setupDatabase from "./setupDb.js";
import { authenticate } from "./middleware/auth.js";
import authController from "./modules/auth/auth.controller.js";
import tenantsRoutes from "./api/tenants";

// Load environment variables directly
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database
async function startServer() {
  try {
    console.log("Setting up database...");
    await setupDatabase();
    console.log("Database setup completed successfully");

    // Start the server after database is set up
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error("Failed to set up database:", err);
    console.log(
      "Server will start, but database functionality may be limited.",
    );

    // Start the server even if database setup fails
    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} (with limited database functionality)`,
      );
      console.log(`API available at http://localhost:${PORT}/api`);
    });
  }
}

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authController);
app.use("/api/users", userRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/prompt-templates", promptTemplatesRoutes);
app.use("/api/response-formats", responseFormatsRoutes);
app.use("/api/test", testRoutes);
app.use("/api/tenants", tenantsRoutes);
app.use("/api/ai", aiConfigRoutes);

// Protected route example
app.get("/api/protected", authenticate, (req: Request, res: Response) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Database connection test endpoint
app.get("/api/db-test", async (_req: Request, res: Response) => {
  try {
    const connected = await testConnection();
    if (connected) {
      res.json({ status: "ok", message: "Database connection successful" });
    } else {
      res
        .status(500)
        .json({ status: "error", message: "Database connection failed" });
    }
  } catch (error) {
    console.error("Database test error:", error);
    res
      .status(500)
      .json({
        status: "error",
        message: "Database connection test failed",
        error: String(error),
      });
  }
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start the server
startServer();
