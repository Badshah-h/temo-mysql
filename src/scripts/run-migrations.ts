#!/usr/bin/env ts-node

import knex from "knex";
import config from "../db/knexfile";

// Determine environment
const environment = process.env.NODE_ENV || "development";

// Initialize knex with the appropriate configuration
const db = knex(config[environment]);

async function runMigrations() {
  try {
    console.log(`Running migrations for ${environment} environment...`);

    // Run latest migrations
    const [batchNo, log] = await db.migrate.latest();

    if (log.length === 0) {
      console.log("Already up to date");
    } else {
      console.log(`Batch ${batchNo} run: ${log.length} migrations`);
      console.log("Migrations completed successfully");
    }

    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    await db.destroy();
    process.exit(1);
  }
}

runMigrations();
