#!/usr/bin/env ts-node

import knex from "knex";
import config from "../db/knexfile";
import { createConnection } from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Determine environment
const environment = process.env.NODE_ENV || "development";

// Initialize knex with the appropriate configuration
const db = knex(config[environment]);

async function resetDatabase() {
  try {
    console.log(`Resetting database for ${environment} environment...`);

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

    // Run migrations
    console.log("Running migrations...");
    await db.migrate.latest();

    // Run seeds
    console.log("Running seeds...");
    await db.seed.run();

    console.log("Database reset completed successfully");
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error("Database reset failed:", error);
    await db.destroy();
    process.exit(1);
  }
}

// Confirm before resetting in production
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
