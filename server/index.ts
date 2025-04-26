import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { testConnection } from "./lib/db.js";
import authRoutes from "./api/auth.js";
import userRoutes from "./api/users.js";
import { authenticate } from "./middleware/auth.js";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Configure Express
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testConnection()
  .then((connected: boolean) => {
    if (!connected) {
      console.error("Database connection failed. Server will start, but functionality may be limited.");
    } else {
      console.log("Database connection successful");
    }
  })
  .catch((error: Error) => {
    console.error("Error testing database connection:", error);
  });

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

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
