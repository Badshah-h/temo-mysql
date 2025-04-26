import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { setupRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

// Create Express application
const app = express();

// Apply global middleware
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup API routes
setupRoutes(app);

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Apply error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
