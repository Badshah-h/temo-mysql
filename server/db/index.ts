import knex from "knex";
import config from "./knexfile.js";
import { testConnection } from "../lib/db";

// Determine environment
const environment = process.env.NODE_ENV || "development";

// Initialize knex with the appropriate configuration
const db = knex(config[environment]);

/**
 * Initialize database
 * - Tests connection
 * - Runs migrations if needed
 */
export async function initializeDatabase() {
  try {
    // Test MySQL connection
    const connected = await testConnection();
    if (!connected) {
      throw new Error("Failed to connect to MySQL database");
    }

    console.log("Database connection successful");
    return true;
  } catch (error) {
    console.error("Database initialization failed:", error);
    return false;
  }
}

export default db;
