import { Knex } from "knex";
import bcrypt from "bcryptjs";

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex("user_roles").del();
  await knex("refresh_tokens").del();
  await knex("users").del();
  await knex("roles").del();

  // Insert roles
  const roleIds = await knex("roles").insert([
    { name: "admin", description: "Administrator with full access" },
    { name: "user", description: "Regular user with limited access" },
    { name: "moderator", description: "User with moderation privileges" },
  ]);

  // Hash password for admin user
  const hashedPassword = await bcrypt.hash("admin123", 10);

  // Insert admin user
  const [adminId] = await knex("users").insert({
    email: "admin@example.com",
    password: hashedPassword,
    full_name: "Admin User",
    role: "admin",
  });

  // Get role ID for admin
  const [adminRole] = await knex("roles").where("name", "admin").select("id");

  // Assign admin role to admin user
  await knex("user_roles").insert({
    user_id: adminId,
    role_id: adminRole.id,
  });

  // Insert a test user
  const [userId] = await knex("users").insert({
    email: "user@example.com",
    password: await bcrypt.hash("user123", 10),
    full_name: "Test User",
    role: "user",
  });

  // Get role ID for user
  const [userRole] = await knex("roles").where("name", "user").select("id");

  // Assign user role to test user
  await knex("user_roles").insert({
    user_id: userId,
    role_id: userRole.id,
  });
}
