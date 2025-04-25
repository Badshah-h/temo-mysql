// Database reset script
import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function resetDatabase() {
  const environment = process.env.NODE_ENV || "development";
  
  try {
    console.log(`Resetting database for ${environment} environment...`);
    console.log(`Host: ${process.env.DB_HOST || "localhost"}`);
    console.log(`Port: ${process.env.DB_PORT || "3306"}`);
    console.log(`User: ${process.env.DB_USER || "root"}`);
    console.log(`Database: ${process.env.DB_NAME || "chat_widget_db"}`);

    // Create connection to MySQL server (without database)
    const connection = await createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    // Drop and recreate database
    const dbName = process.env.DB_NAME || "chat_widget_db";
    await connection.query(`DROP DATABASE IF EXISTS ${dbName}`);
    await connection.query(
      `CREATE DATABASE ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );

    console.log(`Database ${dbName} has been reset`);
    await connection.end();

    // Run the setup script to apply migrations
    const setupScript = await import("./setup-db.mjs");
    await setupScript.default();

    console.log("Database reset completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Database reset failed:", error);
    process.exit(1);
  }
}

// Confirm before resetting in production
const environment = process.env.NODE_ENV || "development";
if (environment === "production") {
  console.log("WARNING: You are about to reset the PRODUCTION database!");
  console.log("This will DELETE ALL DATA. This action cannot be undone.");
  console.log("To proceed, set the CONFIRM_RESET=yes environment variable.");

  if (process.env.CONFIRM_RESET !== "yes") {
    console.log("Operation cancelled. Database was not reset.");
    process.exit(0);
  }
}

resetDatabase();
