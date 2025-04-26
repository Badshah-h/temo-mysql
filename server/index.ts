import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { testConnection } from "./lib/db";
import authRoutes from "./api/auth";
import userRoutes from "./api/users";
import rolesRoutes from "./api/roles";
import permissionsRoutes from "./api/permissions";
import setupDatabase from "./setupDb";
import { authenticate } from "./middleware/auth";

// Load environment variables directly
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Initialize database
setupDatabase().catch((err: Error) => {
  console.error("Failed to set up database:", err);
  // Don't exit process, allow server to start anyway
  console.log("Server will start, but database functionality may be limited.");
});

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/api/permissions", permissionsRoutes);

// Protected route example
app.get("/api/protected", authenticate, (req: Request, res: Response) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
