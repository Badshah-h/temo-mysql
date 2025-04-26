import knex from "knex";
import dbConfig from "../config/database";

// Create a knex instance with the database configuration
export const db = knex(dbConfig);

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await db.raw("SELECT 1");
    console.log("Database connection established successfully");
    return true;
  } catch (error) {
    console.error("Failed to connect to database:", error);
    return false;
  }
}

export default db;
