import { seedAdminUser } from "../db/seeds/01_default_admin.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

async function seedDatabase() {
  try {
    console.log("Starting database seeding...");

    // Seed admin user
    await seedAdminUser();

    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
