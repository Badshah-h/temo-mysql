// Database setup script using Knex
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import knex from "knex";
import { spawn } from "child_process";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function setupDatabase() {
  console.log("Setting up database...");
  console.log(`Host: ${process.env.DB_HOST || "localhost"}`);
  console.log(`Port: ${process.env.DB_PORT || "3306"}`);
  console.log(`User: ${process.env.DB_USER || "root"}`);
  console.log(`Database: ${process.env.DB_NAME || "chat_widget_db"}`);

  try {
    // Create connection to MySQL server (without database)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "3306", 10),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
    });

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || "chat_widget_db";
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Database ${dbName} created or already exists`);

    // Close the direct MySQL connection
    await connection.end();

    // Now run migrations using Knex
    console.log("Running migrations with Knex...");

    // Import knexfile configuration
    const { default: knexConfig } = await import("../db/knexfile.js");

    // Create Knex instance with the development configuration
    const environment = process.env.NODE_ENV || "development";
    const db = knex(knexConfig[environment]);

    console.log(`Using environment: ${environment}`);
    console.log(
      `Migration directory: ${knexConfig[environment].migrations.directory}`,
    );

    // Run migrations
    console.log("Running latest migrations...");
    const [batchNo, log] = await db.migrate.latest();

    if (log.length === 0) {
      console.log("Already up to date");
    } else {
      console.log(`Batch ${batchNo} run: ${log.length} migrations`);
      console.log(`Migrations: ${log.join(", ")}`);
    }

    // Close the database connection
    await db.destroy();

    console.log("Database schema setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  }
}

// Run the database setup
console.log("Starting database setup...");

setupDatabase()
  .then(() => {
    console.log("Database setup completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database setup failed:", error);
    process.exit(1);
  });
