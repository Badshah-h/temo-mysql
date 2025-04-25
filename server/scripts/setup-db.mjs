// Database setup script
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

async function setupDatabase() {
  console.log("Setting up database...");
  console.log(`Host: ${process.env.DB_HOST || "localhost"}`);
  console.log(`Port: ${process.env.DB_PORT || "3306"}`);
  console.log(`User: ${process.env.DB_USER || "root"}`);
  console.log(`Database: ${process.env.DB_NAME || "chat_widget_db"}`);

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
    const migrationsDir = path.join(__dirname, "../db/migrations");
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      console.log(`Migrations directory not found at ${migrationsDir}`);
      console.log("Creating migrations directory...");
      fs.mkdirSync(migrationsDir, { recursive: true });
    }
    
    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (migrationFiles.length === 0) {
      console.log("No migration files found. Creating initial schema...");
      
      // Create initial schema if no migration files exist
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role ENUM('admin', 'user', 'moderator') NOT NULL DEFAULT 'user',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          last_login TIMESTAMP NULL,
          is_active BOOLEAN DEFAULT TRUE,
          INDEX idx_email (email),
          INDEX idx_role (role)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      
      console.log("Initial schema created successfully");
    } else {
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
    }

    console.log("Database schema setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
    throw error;
  } finally {
    await connection.end();
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
