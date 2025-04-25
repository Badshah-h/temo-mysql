import fs from "fs";
import path from "path";
import mysql from "mysql2/promise";

async function setupDatabase() {
  // Create connection to MySQL server (without database)
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
  });

  try {
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || "chat_widget_db";
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`Database ${dbName} created or already exists`);

    // Use the database
    await connection.query(`USE ${dbName}`);

    // Read and execute schema SQL
    const schemaPath = path.join(__dirname, "schema.sql");
    const schemaSql = fs.readFileSync(schemaPath, "utf8");

    // Split SQL statements by semicolon and execute each one
    const statements = schemaSql.split(";").filter((stmt) => stmt.trim());

    for (const statement of statements) {
      await connection.query(statement);
    }

    console.log("Database schema setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await connection.end();
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then(() => console.log("Database setup complete"))
    .catch((err) => console.error("Database setup failed:", err));
}

export default setupDatabase;
