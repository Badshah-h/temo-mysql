// Migration runner script using Knex
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import knex from "knex";
import { createRequire } from "module";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function runMigrations() {
  console.log("Running migrations with Knex...");
  console.log(`Host: ${process.env.DB_HOST || "localhost"}`);
  console.log(`Port: ${process.env.DB_PORT || "3306"}`);
  console.log(`User: ${process.env.DB_USER || "root"}`);
  console.log(`Database: ${process.env.DB_NAME || "chat_widget_db"}`);

  try {
    // Import knexfile configuration directly using require
    const knexConfig = require("../db/knexfile.ts").default;

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

    console.log("All migrations applied successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  }
}

// Run the migrations
runMigrations()
  .then(() => {
    console.log("Migration process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Migration process failed:", error);
    process.exit(1);
  });
