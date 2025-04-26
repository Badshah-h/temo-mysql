import bcrypt from "bcryptjs";
import pool from "../../lib/db.js";

/**
 * Seed an admin user if none exists
 */
export async function seedAdminUser() {
  try {
    // Check if admin user exists
    const [adminUsers] = await pool.execute(
      `SELECT u.id FROM users u 
       JOIN user_roles ur ON u.id = ur.user_id 
       JOIN roles r ON ur.role_id = r.id 
       WHERE r.name = 'admin'`,
    );

    if (adminUsers.length > 0) {
      console.log("Admin user already exists, skipping seed");
      return;
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash("admin123", 10);

    const [result] = await pool.execute(
      "INSERT INTO users (email, password, full_name, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())",
      ["admin@example.com", hashedPassword, "Admin User"],
    );

    const userId = result.insertId;

    // Get admin role ID
    const [roles] = await pool.execute(
      "SELECT id FROM roles WHERE name = 'admin'",
    );

    if (roles.length === 0) {
      throw new Error("Admin role not found");
    }

    const adminRoleId = roles[0].id;

    // Assign admin role to user
    await pool.execute(
      "INSERT INTO user_roles (user_id, role_id, created_at) VALUES (?, ?, NOW())",
      [userId, adminRoleId],
    );

    console.log("Admin user created successfully");
  } catch (error) {
    console.error("Error seeding admin user:", error);
    throw error;
  }
}
