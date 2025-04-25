import express from "express";
import cors from "cors";
import authRoutes from "./api/auth";
import userRoutes from "./api/users";
import setupDatabase from "./setupDb";
import { authenticate } from "./middleware/auth";

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
