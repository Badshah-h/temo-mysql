import mysql from "mysql2/promise";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function setupDatabase() {
  console.log("Setting up database with default tenant and roles...");

  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "chatwidget",
  });

  try {
    // Check if tenants table exists
    const [tables] = await connection.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'tenants'",
      [process.env.DB_NAME || "chatwidget"],
    );

    if (Array.isArray(tables) && tables.length > 0) {
      // Insert default tenant if it doesn't exist
      await connection.query(
        "INSERT INTO tenants (name, slug, created_at, updated_at) " +
          "SELECT 'Default Tenant', 'default', NOW(), NOW() " +
          "WHERE NOT EXISTS (SELECT 1 FROM tenants WHERE slug = 'default')",
      );
      console.log("Default tenant created or already exists");

      // Check if roles table exists
      const [roleTables] = await connection.query(
        "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_name = 'roles'",
        [process.env.DB_NAME || "chatwidget"],
      );

      if (Array.isArray(roleTables) && roleTables.length > 0) {
        // Insert default roles if they don't exist
        await connection.query(
          "INSERT INTO roles (name, description, created_at, updated_at) " +
            "SELECT 'admin', 'Administrator with full access', NOW(), NOW() " +
            "WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'admin')",
        );

        await connection.query(
          "INSERT INTO roles (name, description, created_at, updated_at) " +
            "SELECT 'user', 'Regular user with limited access', NOW(), NOW() " +
            "WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'user')",
        );

        console.log("Default roles created or already exist");
      } else {
        console.log("Roles table does not exist yet");
      }
    } else {
      console.log("Tenants table does not exist yet. Run migrations first.");
    }

    console.log("Database setup completed successfully");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    await connection.end();
  }
}

setupDatabase();
