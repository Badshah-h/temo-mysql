import bcrypt from "bcrypt";
import { db } from "../src/db";

async function seedData() {
  try {
    console.log("Seeding data...");

    // Check if admin user exists
    const adminExists = await db("users")
      .where("email", "admin@example.com")
      .first();

    if (!adminExists) {
      // Create admin user
      const hashedPassword = await bcrypt.hash("admin123", 10);
      const [adminId] = await db("users").insert({
        email: "admin@example.com",
        password: hashedPassword,
        full_name: "Admin User",
        created_at: new Date(),
        updated_at: new Date(),
      });

      // Get admin role
      const adminRole = await db("roles").where("name", "admin").first();
      if (adminRole) {
        // Assign admin role to admin user
        await db("user_roles").insert({
          user_id: adminId,
          role_id: adminRole.id,
          created_at: new Date(),
        });
      }

      console.log("Admin user created successfully");
    } else {
      console.log("Admin user already exists, skipping");
    }

    // Create sample response formats if they don't exist
    const formatExists = await db("response_formats")
      .where("name", "Standard Response")
      .first();

    if (!formatExists) {
      await db("response_formats").insert({
        name: "Standard Response",
        description:
          "Standard response format with title, content, and actions",
        structure: JSON.stringify({
          title: "",
          content: "",
          actions: [],
        }),
        category: "General",
        is_global: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      console.log("Sample response format created successfully");
    }

    // Create sample template if it doesn't exist
    const templateExists = await db("templates")
      .where("name", "General Chat")
      .first();

    if (!templateExists) {
      await db("templates").insert({
        name: "General Chat",
        description: "General purpose chat template",
        content:
          "You are a helpful assistant. Answer the following question: {{query}}",
        category: "General",
        is_global: true,
        created_at: new Date(),
        updated_at: new Date(),
      });

      console.log("Sample template created successfully");
    }

    console.log("Data seeding completed successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

seedData();
