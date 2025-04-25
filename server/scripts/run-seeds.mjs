// Seed runner script
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

async function runSeeds() {
  console.log("Running seeds...");
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
    // Get all seed files in order
    const seedsDir = path.join(__dirname, "../db/seeds");
    
    // Check if seeds directory exists
    if (!fs.existsSync(seedsDir)) {
      console.log(`Seeds directory not found at ${seedsDir}`);
      console.log("Creating seeds directory...");
      fs.mkdirSync(seedsDir, { recursive: true });
      
      // Create default admin user if no seed files exist
      console.log("Creating default admin user...");
      
      // Hash the default password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      
      // Check if users table exists
      const [tables] = await connection.query(
        "SHOW TABLES LIKE 'users'"
      );
      
      if (tables.length > 0) {
        // Insert default admin user
        await connection.query(`
          INSERT INTO users (email, password, full_name, role) 
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            password = VALUES(password),
            full_name = VALUES(full_name),
            role = VALUES(role)
        `, ["admin@example.com", hashedPassword, "Admin User", "admin"]);
        
        console.log("Default admin user created successfully");
      } else {
        console.log("Users table does not exist. Skipping default user creation.");
      }
      
      return;
    }
    
    const seedFiles = fs
      .readdirSync(seedsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (seedFiles.length === 0) {
      console.log("No seed files found. Creating default admin user...");
      
      // Hash the default password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin123", salt);
      
      // Check if users table exists
      const [tables] = await connection.query(
        "SHOW TABLES LIKE 'users'"
      );
      
      if (tables.length > 0) {
        // Insert default admin user
        await connection.query(`
          INSERT INTO users (email, password, full_name, role) 
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            password = VALUES(password),
            full_name = VALUES(full_name),
            role = VALUES(role)
        `, ["admin@example.com", hashedPassword, "Admin User", "admin"]);
        
        console.log("Default admin user created successfully");
      } else {
        console.log("Users table does not exist. Skipping default user creation.");
      }
      
      return;
    }

    // Execute each seed file
    for (const file of seedFiles) {
      console.log(`Applying seed: ${file}`);
      const filePath = path.join(seedsDir, file);
      const sql = fs.readFileSync(filePath, "utf8");

      // Split SQL statements by semicolon and execute each one
      const statements = sql.split(";").filter((stmt) => stmt.trim());

      for (const statement of statements) {
        if (statement.trim()) {
          await connection.query(statement);
        }
      }
      
      console.log(`Seed ${file} applied successfully`);
    }

    console.log("All seeds applied successfully");
  } catch (error) {
    console.error("Error running seeds:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Run the seeds
runSeeds()
  .then(() => {
    console.log("Seeding process completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Seeding process failed:", error);
    process.exit(1);
  });
