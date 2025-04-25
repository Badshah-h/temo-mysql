import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log("Setting up database...");

  // Create connection to MySQL server (without database)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "3306", 10),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || "chat_widget_db";
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
    );
    console.log(`Database ${dbName} created or already exists`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Get all migration files in order
    const migrationsDir = path.join(__dirname, "..", "db", "migrations");
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    // Execute each migration file
    for (const file of migrationFiles) {
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
    }

    console.log("Database schema setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => console.log("Database setup complete"))
    .catch((err) => {
      console.error("Database setup failed:", err);
      process.exit(1);
    });
}

export default setupDatabase;
