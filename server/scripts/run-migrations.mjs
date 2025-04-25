// Migration runner script
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function runMigrations() {
  console.log("Running migrations...");
  console.log(`Host: ${process.env.DB_HOST || "localhost"}`);
  console.log(`Port: ${process.env.DB_PORT || "3306"}`);
  console.log(`User: ${process.env.DB_USER || "root"}`);
  console.log(`Database: ${process.env.DB_NAME || "chat_widget_db"}`);

  // Create connection to MySQL server with database
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chat_widget_db",
  });

  try {
    // Get all migration files in order
    const migrationsDir = path.join(__dirname, "../db/migrations");
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.log(`Migrations directory not found at ${migrationsDir}`);
      console.log("Creating migrations directory...");
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log("No migrations to run.");
      return;
    }
    
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (migrationFiles.length === 0) {
      console.log("No migration files found.");
      return;
    }

    // Check if migrations table exists
    const [tables] = await connection.query(
      "SHOW TABLES LIKE 'migrations'"
    );
    
    if (tables.length === 0) {
      // Create migrations table if it doesn't exist
      await connection.query(`
        CREATE TABLE migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      console.log("Created migrations tracking table");
    }

    // Get applied migrations
    const [appliedMigrations] = await connection.query(
      "SELECT name FROM migrations"
    );
    const appliedMigrationNames = appliedMigrations.map(m => m.name);

    // Filter out already applied migrations
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrationNames.includes(file)
    );

    if (pendingMigrations.length === 0) {
      console.log("No pending migrations to apply");
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations`);

    // Execute each pending migration file
    for (const file of pendingMigrations) {
      console.log(`Applying migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      // Split SQL statements by semicolon and execute each one
      const statements = sql.split(";").filter((stmt) => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }

      // Record the migration as applied
      await connection.query(
        "INSERT INTO migrations (name) VALUES (?)",
        [file]
      );
      
      console.log(`Migration ${file} applied successfully`);
    }

    console.log("All migrations applied successfully");
  } catch (error) {
    console.error("Error running migrations:", error);
    throw error;
  } finally {
    await connection.end();
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
