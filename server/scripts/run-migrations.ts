import fs from "fs";
import path from "path";
import { db } from "../src/db";

async function runMigrations() {
  try {
    console.log("Running migrations...");

    // Create migrations table if it doesn't exist
    await db.schema.createTableIfNotExists("migrations", (table) => {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.timestamp("executed_at").defaultTo(db.fn.now());
    });

    // Get all migration files
    const migrationsDir = path.join(__dirname, "../src/migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort(); // Sort to ensure migrations run in order

    // Get already executed migrations
    const executedMigrations = await db("migrations").select("name");
    const executedMigrationNames = executedMigrations.map((m) => m.name);

    // Run pending migrations
    for (const file of migrationFiles) {
      if (!executedMigrationNames.includes(file)) {
        console.log(`Running migration: ${file}`);

        // Read migration file
        const migrationPath = path.join(migrationsDir, file);
        const migrationSql = fs.readFileSync(migrationPath, "utf8");

        // Execute migration
        await db.raw(migrationSql);

        // Record migration
        await db("migrations").insert({ name: file });

        console.log(`Migration ${file} completed successfully`);
      } else {
        console.log(`Migration ${file} already executed, skipping`);
      }
    }

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runMigrations();
