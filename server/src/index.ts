import dotenv from "dotenv";
import path from "path";
import app from "./app";
import { testConnection } from "./db";

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

// Set port
const PORT = process.env.PORT || 3001;

// Start server
async function startServer() {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.warn(
        "Warning: Database connection failed. Some features may not work properly.",
      );
    }

    // Start listening
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Start the server
startServer();
