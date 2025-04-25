#!/usr/bin/env ts-node

import knex from "knex";
import config from "../db/knexfile";

// Determine environment
const environment = process.env.NODE_ENV || "development";

// Initialize knex with the appropriate configuration
const db = knex(config[environment]);

async function runSeeds() {
  try {
    console.log(`Running seeds for ${environment} environment...`);

    // Run all seeds
    await db.seed.run();

    console.log("Seeds completed successfully");
    await db.destroy();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    await db.destroy();
    process.exit(1);
  }
}

runSeeds();
