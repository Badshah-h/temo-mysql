import express from "express";
import cors from "cors";
import authRoutes from "./api/auth.js";
import userRoutes from "./api/users.js";
import setupDatabase from "./setupDb.js";
import { authenticate } from "./middleware/auth.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Initialize database
setupDatabase().catch((err) => {
  console.error("Failed to set up database:", err);
  process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

// Protected route example
app.get("/api/protected", authenticate, (req, res) => {
  res.json({ message: "This is a protected route", user: req.user });
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
