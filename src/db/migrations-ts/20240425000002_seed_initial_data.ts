import { Knex } from "knex";
import fs from "fs";
import path from "path";

export async function up(knex: Knex): Promise<void> {
  // Read and execute the SQL seed file
  const sqlPath = path.join(__dirname, "..", "migrations", "002_seed_data.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  // Split SQL by semicolons and execute each statement
  const statements = sql.split(";").filter((statement) => statement.trim());

  for (const statement of statements) {
    await knex.raw(statement);
  }
}

export async function down(knex: Knex): Promise<void> {
  // Remove seed data
  await knex("user_roles")
    .where(
      "user_id",
      knex("users").where("email", "admin@example.com").select("id"),
    )
    .del();
  await knex("users").where("email", "admin@example.com").del();
  await knex("roles").whereIn("name", ["admin", "user", "moderator"]).del();
}
